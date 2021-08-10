import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { LibraryModule, RegisterCache } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { DynamicRoomProviders } from '../decorators';
import {
  CircadianService,
  KunamiCodeService,
  LightManagerService,
  RemoteAdapterService,
  RoomExplorerService,
  StateManagerService,
} from '../services';

const providers = [
  LightManagerService,
  CircadianService,
  RemoteAdapterService,
  RoomExplorerService,
  StateManagerService,
  KunamiCodeService,
];

@LibraryModule({
  exports: providers,
  imports: [RegisterCache(), DiscoveryModule],
  library: LIB_CONTROLLER_LOGIC,
  providers,
})
export class HomeControllerCustomModule {
  // #region Public Static Methods

  public static forRoot(): DynamicModule {
    const decorated = [...DynamicRoomProviders.values()];
    return {
      exports: [...providers, ...decorated],
      global: true,
      imports: [RegisterCache(), DiscoveryModule, ScheduleModule],
      module: HomeControllerCustomModule,
      providers: [...providers, ...decorated],
    };
  }

  // #endregion Public Static Methods
}
