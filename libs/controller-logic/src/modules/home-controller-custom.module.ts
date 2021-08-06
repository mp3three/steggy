import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { CacheImport, LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import {
  LightFlashService,
  LightingControllerService,
  LightManagerService,
  RoomExplorerService,
} from '../services';

@Global()
@Module({
  exports: [LightingControllerService, LightFlashService, LightManagerService],
  imports: [CacheImport(), DiscoveryModule],
  providers: [
    LightingControllerService,
    LightFlashService,
    LightManagerService,
    RoomExplorerService,
  ],
})
@LoggableModule(LIB_CONTROLLER_LOGIC)
export class HomeControllerCustomModule {}
