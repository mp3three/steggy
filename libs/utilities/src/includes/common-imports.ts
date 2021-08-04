import {
  CACHE_PROVIDER,
  LOG_LEVEL,
  REDIS_HOST,
  REDIS_PORT,
} from '@automagical/contracts/config';
import { CacheModule, DynamicModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import RedisStore from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';

import { AutoConfigService } from '../services';

export function CommonImports(): DynamicModule[] {
  return [
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync({
      inject: [AutoConfigService],
      useFactory(configService: AutoConfigService) {
        return {
          pinoHttp: {
            level: configService.get(LOG_LEVEL),
          },
        };
      },
    }),
    CacheImport(),
    EventEmitterModule.forRoot({
      maxListeners: 20,
      wildcard: true,
    }),
  ];
}
export function CacheImport(): DynamicModule {
  return CacheModule.registerAsync({
    inject: [AutoConfigService],
    useFactory(configService: AutoConfigService) {
      if (configService.get(CACHE_PROVIDER) === 'memory') {
        return {};
      }
      return {
        host: configService.get(REDIS_HOST),
        max: Number.POSITIVE_INFINITY,
        port: configService.get(REDIS_PORT),
        store: RedisStore,
        ttl: 60 * 60 * 24,
      };
    },
  });
}
