import {
  CACHE_PROVIDER,
  REDIS_HOST,
  REDIS_PORT,
} from '@automagical/contracts/config';
import { CacheModule, DynamicModule } from '@nestjs/common';
import RedisStore from 'cache-manager-redis-store';

import { AutoConfigService } from '../services';

export function RegisterCache(): DynamicModule {
  return CacheModule.registerAsync({
    inject: [AutoConfigService],
    useFactory(configService: AutoConfigService) {
      const provider = configService.get(CACHE_PROVIDER);
      if (provider === 'memory') {
        return {};
      }
      return {
        global: true,
        host: configService.get(REDIS_HOST),
        max: Number.POSITIVE_INFINITY,
        port: configService.get(REDIS_PORT),
        store: RedisStore,
        ttl: 60 * 60 * 24,
      };
    },
  });
}
