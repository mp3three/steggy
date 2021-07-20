import {
  CACHE_PROVIDER,
  LOG_LEVEL,
  REDIS_HOST,
  REDIS_PORT,
} from '@automagical/contracts/config';
import { CacheModule, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import RedisStore from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';

export function CommonImports(): DynamicModule[] {
  return [
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          pinoHttp: {
            level: configService.get(LOG_LEVEL),
          },
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        if (configService.get(CACHE_PROVIDER) === 'memory') {
          return {};
        }
        return {
          host: configService.get(REDIS_HOST),
          max: Number.POSITIVE_INFINITY,
          port: configService.get(REDIS_PORT),
          store: RedisStore,
        };
      },
    }),
    EventEmitterModule.forRoot({
      delimiter: '/',
      maxListeners: 20,
      verboseMemoryLeak: true,
      wildcard: true,
    }),
  ];
}
