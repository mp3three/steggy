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
  ) {}

  /**
   * Execute the user provided code inside a wrapper function.
   * Whatever the user returns (via the normal return keyword), will be returned by this function.
   */
  public async exec<T>(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    code = await this.transpile(
      `const __wrapper = async function(){${code}};\n__wrapper();`,
    );
    return await new VM({
      // Should allow for dealing with some async work
      // I'm really not sure what async work there is to do though in this context
      allowAsync: true,
      // Already doing something that's kinda dangerous
      // Let's not 🦶🔫
      eval: false,
      // Data going into the global object
      sandbox: {
        // Load all dynamic data, and provide
        ...(await this.dataAggregator.load()),
        // Variables related to the local flow
        ...parameters,
        // libraries & utils
        dayjs,
        is,
        logger: this.logger,
      },
      timeout: this.timeout,
      // No web assembly... seriously, why?
      wasm: false,
    }).run(code);
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
