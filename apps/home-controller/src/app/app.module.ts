import { ConfigModule } from '@automagical/config';
import { HA_ALL_CONFIGS } from '@automagical/contracts/constants';
import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { CacheModule, Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { load } from 'js-yaml';
import { MqttModule, MqttModuleAsyncOptions } from 'nest-mqtt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ASSETS_PATH, environment } from '../environments/environment';
import {
  ApplicationConfig,
  BEDROOM_CONFIG,
  GAMES_CONFIG,
  GARAGE_CONFIG,
  GUEST_CONFIG,
  LIVING_ROOM_CONFIG,
  LOFT_CONFIG,
} from '../typings/';
import { AppService } from './services/app.service';
import { BedroomService } from './services/bedroom.service';
import { GamesService } from './services/games.service';
import { GarageService } from './services/garage.service';
import { GuestService } from './services/guest.service';
import { LivingService } from './services/living.service';
import { LoftService } from './services/loft.service';
import { MqttClientService } from './services/mqtt-client.service';

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
    CacheModule.register(),
    EventEmitterModule.forRoot({
      wildcard: true,
      // Expected format:
      // * `sensor.sensor_name/event`
      delimiter: '/',
      verboseMemoryLeak: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.register<ApplicationConfig>({
      application: environment,
    }),
    HomeAssistantModule,
    MqttModule.forRootAsync({
      useFactory: async () => {
        const config = await ConfigModule.getConfig<ApplicationConfig>();
        return {
          host: config.application.MQTT_HOST,
          port: config.application.MQTT_PORT,
          logger: {
            useValue: Logger.forNest('nest-mqtt'),
          },
        } as MqttModuleAsyncOptions;
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
  exports: [
    {
      provide: HA_ALL_CONFIGS,
      useValue: configs.map((i) => i.useValue),
    },
  ],
  // controllers: [PhoneController],
})
export class AppModule {
  // #region Public Static Methods

  public static loadConfigs(): {
    useValue: HomeAssistantRoomConfigDTO;
    provide: symbol;
  }[] {
    return;
  }

  // #endregion Public Static Methods
}
