import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import { PersistenceModule } from '@automagical/persistence';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import RedisStore from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';
import { PortalController } from './controllers';
import { LocalsInitMiddlware } from './middleware';
import { CEWrapperService } from './services/';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          ttl: configService.get('THROTTLE_TTL'),
          limit: configService.get('THROTTLE_LIMIT'),
        };
      },
    }),
    ThrottlerModule.forRoot({
      // Limit to 10 requests against a single endpoint per min per ip
      ttl: 60,
      limit: 10,
    }),
    FetchModule,
    PersistenceModule.registerMongoose(),
    ScheduleModule.forRoot(),
    ConfigModule.register('api-server', {
      REDIS_HOST: 'localhost',
      LOG_LEVEL: 'info',
      THROTTLE_LIMIT: 10,
      THROTTLE_TTL: 60,
      REDIS_PORT: 6379,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          pinoHttp: {
            level: configService.get('LOG_LEVEL'),
          },
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          max: Infinity,
          ttl: null,
          store: RedisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        };
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '/',
      verboseMemoryLeak: true,
      // Things really get mad if you cross this limit, increase in increments of 10 as needed
      // Sometimes shows up as a "TypeError: Cannot convert a Symbol value to a string" on start
      maxListeners: 20,
    }),
    PersistenceModule,
  ],
  providers: [CEWrapperService, LocalsInitMiddlware],
  controllers: [PortalController],
})
export class AppModule {}
