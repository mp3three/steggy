import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { APP_NAME, DEFAULT_SETTINGS } from '../environments/environment';
import { ApplicationSettingsDTO } from '../typings';
import { ApplicationService } from './services/application.service';

@Module({
  imports: [
    FetchModule,
    HomeAssistantModule,
    ScheduleModule.forRoot(),
    ConfigModule.register<ApplicationSettingsDTO>(APP_NAME, DEFAULT_SETTINGS),
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
    // CacheModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory(configService: ConfigService) {
    //     return {
    //       host: configService.get('REDIS_HOST'),
    //       max: Number.POSITIVE_INFINITY,
    //       port: configService.get('REDIS_PORT'),
    //       store: RedisStore,
    //     };
    //   },
    // }),
    CacheModule.register(),
    EventEmitterModule.forRoot({
      delimiter: '/',
      maxListeners: 20,
      verboseMemoryLeak: true,
      wildcard: true,
    }),
  ],
  providers: [ApplicationService],
})
export class AppModule {}
