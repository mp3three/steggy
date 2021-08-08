import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { LoggableModule, RegisterCache } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import {
  CircadianService,
  ComplexLogicService,
  KunamiCodeService,
  LightingControllerService,
  LightManagerService,
  RelayService,
  RemoteAdapterService,
  RoomExplorerService,
  StateManagerService,
} from '../services';

const providers = [
  LightingControllerService,
  LightManagerService,
  RoomExplorerService,
  CircadianService,
  RelayService,
  RemoteAdapterService,
  StateManagerService,
  ComplexLogicService,
  KunamiCodeService,
];

@Global()
@Module({
  exports: providers,
  imports: [RegisterCache(), DiscoveryModule],
  providers,
})
@LoggableModule(LIB_CONTROLLER_LOGIC)
export class HomeControllerCustomModule {}
