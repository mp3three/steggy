import { CacheModuleOptions, Injectable } from '@nestjs/common';
import RedisStore from 'cache-manager-redis-store';

import {
  CACHE_PROVIDER,
  REDIS_DEFAULT_TTL,
  REDIS_HOST,
  REDIS_PORT,
} from '../../config';
import { InjectConfig } from '../../decorators/injectors/inject-config.decorator';

/**
 * Provider to bind configurations to the cache module
 */
@Injectable()
export class CacheProviderService {
  constructor(
    @InjectConfig(CACHE_PROVIDER) private readonly cacheProvider: string,
    @InjectConfig(REDIS_HOST) private readonly host: string,
    @InjectConfig(REDIS_PORT) private readonly port: number,
    @InjectConfig(REDIS_DEFAULT_TTL) private readonly defaultTtl: number,
  ) {}

  public getConfig(): CacheModuleOptions {
    const ttl = this.defaultTtl;
    if (this.cacheProvider === 'memory') {
      return {
        isGlobal: true,
        ttl,
      };
    }
    return {
      host: this.host,
      isGlobal: true,
      port: this.port,
      store: RedisStore,
      ttl,
    };
  }
}
