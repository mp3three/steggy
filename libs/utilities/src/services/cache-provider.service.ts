import { CacheModuleOptions, Injectable } from '@nestjs/common';
import RedisStore from 'cache-manager-redis-store';

import {
  CACHE_PROVIDER,
  REDIS_DEFAULT_TTL,
  REDIS_HOST,
  REDIS_PORT,
} from '../config';
import { InjectConfig } from '../decorators/injectors/inject-config.decorator';

@Injectable()
export class CacheProviderService {
  constructor(
    @InjectConfig(CACHE_PROVIDER) private readonly cacheProvider: string,
    @InjectConfig(REDIS_HOST) private readonly host: string,
    @InjectConfig(REDIS_PORT) private readonly port: number,
    @InjectConfig(REDIS_DEFAULT_TTL) private readonly defaultTtl: number,
  ) {}

  public getConfig(): CacheModuleOptions {
    if (this.cacheProvider === 'memory') {
      return {};
    }
    return {
      global: true,
      host: this.host,
      max: Number.POSITIVE_INFINITY,
      port: this.port,
      store: RedisStore,
      ttl: this.defaultTtl,
    };
  }
}
