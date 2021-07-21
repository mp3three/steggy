import { HomeControllerCustomModule } from '@automagical/custom';
import { HomeAssistantModule } from '@automagical/home-assistant';
import {
  AutomagicalConfigModule,
  CommonImports,
  UtilitiesModule,
} from '@automagical/utilities';
import { Module } from '@nestjs/common';

import { APP_NAME, DEFAULT_SETTINGS } from '../environments/environment';
import {
  DownstairsService,
  GamesService,
  GuestBedroomService,
  LoftService,
  MasterBedroomService,
} from '../services';

@Module({
  imports: [
    HomeAssistantModule,
    HomeControllerCustomModule,
    UtilitiesModule,
    AutomagicalConfigModule.register(APP_NAME, DEFAULT_SETTINGS),
    ...CommonImports(),
  ],
  providers: [
    DownstairsService,
    GamesService,
    GuestBedroomService,
    LoftService,
    MasterBedroomService,
  ],
})
export class ApplicationModule {}
