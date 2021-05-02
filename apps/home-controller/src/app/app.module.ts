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
import RedisStore from 'cache-manager-redis-store';
import { MqttModule } from 'nest-mqtt';
import { LoggerModule } from 'nestjs-pino';
import { ApplicationConfig } from '../typings/';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { MqttClientService } from './services/mqtt-client.service';

@Module({
  imports: [
    FetchModule,
    HomeAssistantModule,
    ScheduleModule.forRoot(),
    ConfigModule.register<ApplicationConfig>('home-controller', {
      LOG_LEVEL: 'info',
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
          max: Number.POSITIVE_INFINITY,
          store: RedisStore,
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        };
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      // Expected format:
      // * `sensor.sensor_name/event`
      delimiter: '/',
      verboseMemoryLeak: true,
      // Things really get mad if you cross this limit
      // Sometimes shows up as a "TypeError: Cannot convert a Symbol value to a string" on start
      maxListeners: 20,
    }),
    MqttModule.forRoot({
      host: '10.0.0.33',
      port: 1883,
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
  controllers: [AppController, EntityController],
})
export class AppModule {}
