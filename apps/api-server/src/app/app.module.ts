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
  controllers: [PortalController],
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          limit: configService.get('THROTTLE_LIMIT'),
          ttl: configService.get('THROTTLE_TTL'),
        };
      },
    }),
    FetchModule,
    PersistenceModule.registerMongoose(),
    ScheduleModule.forRoot(),
    ConfigModule.register('api-server', {
      LOG_LEVEL: 'info',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      THROTTLE_LIMIT: 10,
      THROTTLE_TTL: 60,
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
          host: configService.get('REDIS_HOST'),
          max: Number.POSITIVE_INFINITY,
          port: configService.get('REDIS_PORT'),
          store: RedisStore,
        };
      },
    }),
    EventEmitterModule.forRoot({
      delimiter: '/',
      // Instability occurrs if you cross this limit, increase in increments of 10 as needed
// Sometimes shows up as a "TypeError: Cannot convert a Symbol value to a string" on start
maxListeners: 20,
      

verboseMemoryLeak: true,
      
      
      wildcard: true,
    }),
  ],
  providers: [CEWrapperService, LocalsInitMiddlware],
})
export class AppModule {}
