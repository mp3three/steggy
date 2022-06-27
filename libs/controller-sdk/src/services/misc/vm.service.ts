import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectConfig,
} from '@steggy/boilerplate';
import { is, START } from '@steggy/utilities';
import dayjs from 'dayjs';
import { ModuleKind, transpileModule } from 'typescript';
import { VM } from 'vm2';

import { VM_TIMEOUT } from '../../config';
import { BreakoutAPIService } from './breakout-api.service';
import { DataAggregatorService } from './data-aggregator.service';

const SHIFT = 5;
const CACHE_KEY = key => `TRANSPILE_CACHE_${key}`;

@Injectable()
export class VMService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataAggregator: DataAggregatorService,
    @InjectConfig(VM_TIMEOUT) private readonly timeout: number,
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly breakoutApi: BreakoutAPIService,
  ) {}

  /**
   * Execute user provided typescript code
   *
   * Intended for situations where the code is the action itself.
   * Does not return a value, but does have access to the extended command API
   */
  public async command(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<void> {
    code = await this.transpile(code);
    await new VM({
      allowAsync: true,
      eval: false,
      sandbox: {
        ...(await this.baseSandbox()),
        ...parameters,
        steggy: this.breakoutApi,
      },
      timeout: this.timeout,
      wasm: false,
    }).run(code);
  }

  /**
   * Execute user provided typescript code
   *
   * Intended for retrieving values, extended command API not provided
   */
  public async fetch<T>(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    code = await this.transpile(code);
    return await new VM({
      allowAsync: true,
      eval: false,
      sandbox: {
        ...(await this.baseSandbox()),
        ...parameters,
      },
      timeout: this.timeout,
      wasm: false,
    }).run(code);
  }

  private async baseSandbox() {
    return {
      // Load all dynamic data, and provide
      ...(await this.dataAggregator.load()),
      // libraries & utils
      dayjs,
      is,
      logger: this.logger,
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

  private async transpile(code: string): Promise<string> {
    const start = Date.now();
    code = `const __wrapper = async function(){${code}};\n__wrapper();`;

    const hashed = this.hash(code);
    const key = CACHE_KEY(hashed.toString());
    const data = await this.cache.get<string>(key);
    // A cache hit is dramatically faster
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
