import { ConfigModule } from '@automagical/config';
import { FetchModule } from '@automagical/fetch';
import {
  EntityController,
  HomeAssistantModule,
} from '@automagical/home-assistant';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { MqttModule } from 'nest-mqtt';
import { LoggerModule } from 'nestjs-pino';

import { APP_NAME, DEFAULT_SETTINGS } from '../environments/environment';
import { ApplicationSettingsDTO, MQTT_HOST, MQTT_PORT } from '../typings';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MqttClientService } from './services/mqtt-client.service';

@Module({
  controllers: [AppController, EntityController],
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
    MqttModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          host: configService.get(MQTT_HOST),
          port: configService.get(MQTT_PORT),
        };
      },
    }),
    // MqttModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory(configService: ConfigService) {
    //     const config = {
    //       host: configService.get('application.MQTT_HOST'),
    //       port: Number(configService.get('application.MQTT_PORT')),
    //       // logger: {
    //       //   useClass: Logger,
    //       // },
    //     };
    //     return config;
    //   },
    // }),
  ],
  providers: [AppService, MqttClientService],
})
export class AppModule {}
