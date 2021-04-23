import { ConfigModule } from '@automagical/config';
import { HA_ALL_CONFIGS } from '@automagical/contracts/constants';
import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { CacheModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { MqttModule } from 'nest-mqtt';
import { Logger, LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { ASSETS_PATH } from '../environments/environment';
import {
  ApplicationConfig,
  BEDROOM_CONFIG,
  GAMES_CONFIG,
  GARAGE_CONFIG,
  GUEST_CONFIG,
  LIVING_ROOM_CONFIG,
  LOFT_CONFIG,
} from '../typings/';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { BedroomService } from './services/bedroom.service';
import { GamesService } from './services/games.service';
import { GarageService } from './services/garage.service';
import { GuestService } from './services/guest.service';
import { LivingService } from './services/living.service';
import { LoftService } from './services/loft.service';
import { MqttClientService } from './services/mqtt-client.service';
import { FetchModule } from '@automagical/fetch';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'cache-manager-redis-store';

const configs = [
  {
    provide: BEDROOM_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'bedroom.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
  {
    provide: GAMES_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'games.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
  {
    provide: GARAGE_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'garage.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
  {
    provide: GUEST_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'guest.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
  {
    provide: LOFT_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'loft.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
  {
    provide: LIVING_ROOM_CONFIG,
    useValue: load(
      readFileSync(join(ASSETS_PATH, 'living_room.yaml'), 'utf-8'),
    ) as HomeAssistantRoomConfigDTO,
  },
];

@Module({
  imports: [
    FetchModule,
    HomeAssistantModule,
    ScheduleModule.forRoot(),
    ConfigModule.register<ApplicationConfig>('home-controller', {}),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          max: Infinity,
          ttl: null,
          store: RedisStore,
          host: configService.get('application.REDIS_HOST'),
          port: configService.get('application.REDIS_PORT'),
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
    MqttModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          host: configService.get('application.MQTT_HOST'),
          port: Number(configService.get('application.MQTT_PORT')),
          logger: {
            useClass: Logger,
          },
        };
      },
    }),
  ],
  providers: [
    AppService,
    BedroomService,
    GamesService,
    GarageService,
    GuestService,
    LivingService,
    LoftService,
    MqttClientService,
    // PhoneService,
    ...configs,
    {
      provide: HA_ALL_CONFIGS,
      useValue: configs.map((i) => i.useValue),
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
