import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { LoggableModule, RegisterCache } from '@automagical/utilities';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DynamicRoomProviders } from '../decorators';
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
  CircadianService,
  RelayService,
  RemoteAdapterService,
  RoomExplorerService,
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
export class HomeControllerCustomModule {
  // #region Public Static Methods

  public static forRoot(): DynamicModule {
    const decorated = [...DynamicRoomProviders.values()];
    return {
      exports: [...providers, ...decorated],
      global: true,
      imports: [RegisterCache(), DiscoveryModule],
      module: HomeControllerCustomModule,
      providers: [...providers, ...decorated],
    };
  }

  // #endregion Public Static Methods
}
