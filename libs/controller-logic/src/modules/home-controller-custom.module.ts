import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { CacheImport, LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import {
  CircadianService,
  LightingControllerService,
  LightManagerService,
  RelayService,
  RoomExplorerService,
  StateManagerService,
} from '../services';

const providers = [
  LightingControllerService,
  LightManagerService,
  RoomExplorerService,
  CircadianService,
  RelayService,
  StateManagerService,
];

@Global()
@Module({
  exports: providers,
  imports: [CacheImport(), DiscoveryModule],
  providers,
})
@LoggableModule(LIB_CONTROLLER_LOGIC)
export class HomeControllerCustomModule {}
