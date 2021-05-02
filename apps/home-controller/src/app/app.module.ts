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
  controllers: [AppController, EntityController],
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
          host: configService.get('REDIS_HOST'),
          max: Number.POSITIVE_INFINITY,
          port: configService.get('REDIS_PORT'),
          store: RedisStore,
        };
      },
    }),
    EventEmitterModule.forRoot({
      // Expected format:
// * `sensor.sensor_name/event`
delimiter: '/',
      
      
      // Instability occurrs if you cross this limit, increase in increments of 10 as needed
// Sometimes shows up as a "TypeError: Cannot convert a Symbol value to a string" on start
maxListeners: 20,
      

verboseMemoryLeak: true,
      
      
      wildcard: true,
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
})
export class AppModule {}
