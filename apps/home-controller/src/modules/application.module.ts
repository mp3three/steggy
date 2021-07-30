import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  CommonImports,
  LoggableModule,
  MQTTModule,
  SymbolProviderModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';

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
    SymbolProviderModule.forRoot(APP_HOME_CONTROLLER),
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
