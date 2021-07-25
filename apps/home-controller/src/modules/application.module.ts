import { HomeControllerCustomModule } from '@automagical/custom';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { BasicNestLogger } from '@automagical/server';
import {
  AutomagicalConfigModule,
  CommonImports,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { MqttModule } from 'nest-mqtt';

import { APP_NAME, DEFAULT_SETTINGS } from '../environments/environment';
import {
  BedRemoteService,
  DownstairsService,
  GamesRoomService,
  GarageService,
  GuestBedroomService,
  LoftService,
  MasterBedroomService,
} from '../services';

@Module({
  imports: [
    HomeAssistantModule,
    HomeControllerCustomModule,
    UtilitiesModule,
    // MqttModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory(configService: ConfigService) {
    //     return {
    //       host: '10.0.0.33',
    //       logger: {
    //         useValue: BasicNestLogger(),
    //       },
    //       port: 1883,
    //     } as MqttModuleOptions;
    //   },
    // }),
    MqttModule.forRoot({
      host: '10.0.0.33',
      logger: {
        useValue: BasicNestLogger(),
      },
      port: 1883,
    }),
    AutomagicalConfigModule.register(APP_NAME, DEFAULT_SETTINGS),
    ...CommonImports(),
  ],
  providers: [
    DownstairsService,
    GarageService,
    GamesRoomService,
    GuestBedroomService,
    BedRemoteService,
    LoftService,
    MasterBedroomService,
  ],
})
export class ApplicationModule {}
