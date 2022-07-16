import { INestApplication, Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
} from '@steggy/boilerplate';
import { CodeType } from '@steggy/controller-shared';
import { is, sleep, START } from '@steggy/utilities';
import dayjs from 'dayjs';
import { ModuleKind, transpileModule } from 'typescript';
import { VM } from 'vm2';

import { VM_COMMAND_TIMEOUT, VM_FETCH_TIMEOUT } from '../../config';
import { CodeService } from '../code.service';
import { BreakoutAPIService } from './breakout-api.service';
import { DataAggregatorService } from './data-aggregator.service';
import { HACallTypeGenerator } from './ha-call-type-generator.service';

const SHIFT = 5;
const CACHE_KEY = key => `TRANSPILE_CACHE_${key}`;

@Injectable()
export class VMService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataAggregator: DataAggregatorService,
    @InjectConfig(VM_FETCH_TIMEOUT) private readonly fetchTimeout: number,
    @InjectConfig(VM_COMMAND_TIMEOUT) private readonly commandTimeout: number,
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly breakoutApi: BreakoutAPIService,
    private readonly callProxy: HACallTypeGenerator,
    private readonly codeService: CodeService,
  ) {}

  private app: INestApplication;

  /**
   * Execute user provided typescript code
   *
   * Intended for situations where the code is the action itself.
   * Does not return a value, but does have access to the extended command API
   */
  public async command(
    code: string,
    parameters: Record<string, unknown> = {},
    context?: string,
  ): Promise<void> {
    code = await this.transpile(code, CodeType.execute);
    try {
      const call_service = this.callProxy.buildProxy();
      await new VM({
        allowAsync: true,
        eval: false,
        sandbox: {
          ...(await this.baseSandbox(context, CodeType.execute)),
          ...parameters,
          cacheManager: {
            del: async key => await this.cache.del(key),
            get: async key => await this.cache.get(key),
            keys: async pattern => await this.cache.store.keys(pattern),
            set: async (key, value, ttl) =>
              await this.cache.set(key, value, { ttl }),
          },
          call_service,
          sleep,
          steggy: this.breakoutApi,
        },
        timeout: this.commandTimeout,
        wasm: false,
      }).run(code);
    } catch (error) {
      const response = error.response || error;
      const message = response.message;
      delete response.message;
      this.logger.error({ response }, message || `Code evaluation threw error`);
    }
  }

  /**
   * Execute user provided typescript code
   *
   * Intended for retrieving values, extended command API not provided
   */
  public async fetch<T>(
    code: string,
    parameters: Record<string, unknown> = {},
    context?: string,
  ): Promise<T> {
    code = await this.transpile(code, CodeType.request);
    try {
      return await new VM({
        allowAsync: true,
        eval: false,
        sandbox: {
          ...(await this.baseSandbox(context, CodeType.request)),
          ...parameters,
        },
        timeout: this.fetchTimeout,
        wasm: false,
      }).run(code);
    } catch (error) {
      const response = error.response || error;
      const message = response.message;
      delete response.message;
      this.logger.error({ response }, message || `Code evaluation threw error`);
      return undefined;
    }
  }

  protected onPostInit(app: INestApplication): void {
    this.app = app;
  }

  private async baseSandbox(context: string, type: CodeType) {
    const logger = await this.app.resolve(AutoLogService);
    logger['context'] = `VM:${context || type}`;
    return {
      // Load all dynamic data, and provide
      ...(await this.dataAggregator.load()),
      // libraries & utils
      dayjs,
      is,
      logger,
    };
  }

  /**
   * Ported version of Java `String.hashCode()`
   * Tweaked a bit for repo code standards, and eslint was really wanting to use `codePointAt`.
   *
   * Just need a fast way to generate a repeatable cache key from a string.
   */
  private hash(text: string): string {
    let hash = START;
    for (let i = START; i < text.length; i++) {
      hash = (hash << SHIFT) - hash + text.codePointAt(i);
      hash = Math.trunc(hash);
    }
    return hash.toString();
  }

  /**
   * Prepend relevant user code, then request that typescript transpiles it into normal js.
   *
   * Then, cache the result against the string hash of the script version of the code.
   * If the code changes, or any of the dependencies change, it will automatically invalidate the cache and rebuild.
   *
   * Don't currently see a need to pre-emptively clear cache.
   * The memory cache MAY be an issue in the future, but sane usage with redis should be fine
   */
  private async transpile(code: string, type: CodeType): Promise<string> {
    const start = Date.now();
    // VM appears to return value provided by the final instruction to execute
    code = [
      await this.codeService.code(type),
      'const __wrapper = async function() {',
      code,
      '};',
      '__wrapper();',
    ].join(`\n`);

    const hashed = this.hash(code);
    const key = CACHE_KEY(hashed.toString());
    const data = await this.cache.get<string>(key);

    if (!is.empty(data)) {
      this.logger.debug({ key }, `Loaded transpile cache`);
      return data;
    }
    const result = transpileModule(code, {
      compilerOptions: { module: ModuleKind.CommonJS },
    });
    // The most minimal examples take ~40-50ms on my machine
    // Larger examples on weaker machines could easily take 250ms
    // Caching is required for performance
    this.logger.debug({ key }, `Transpile time {${Date.now() - start}ms}`);
    await this.cache.set(key, result.outputText);
    return result.outputText;
  }
}
