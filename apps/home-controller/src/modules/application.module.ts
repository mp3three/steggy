import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeControllerCustomModule } from '@automagical/custom';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  AutomagicalConfigModule,
  CommonImports,
  LoggableModule,
  MQTTModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';

import { APP_NAME, DEFAULT_SETTINGS } from '../environments/environment';
import {
  ApplicationService,
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
    MQTTModule,
    AutomagicalConfigModule.register(APP_NAME, DEFAULT_SETTINGS),
    ...CommonImports(),
  ],
  providers: [
    DownstairsService,
    GarageService,
    ApplicationService,
    GamesRoomService,
    GuestBedroomService,
    BedRemoteService,
    LoftService,
    MasterBedroomService,
  ],
})
@LoggableModule(APP_HOME_CONTROLLER)
export class ApplicationModule {}
