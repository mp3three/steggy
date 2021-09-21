import { LIB_CONTROLLER_LOGIC } from '@automagical/utilities';
import { LibraryModule, RegisterCache } from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { RoomAPIController } from '../controllers';
import { DynamicRoomProviders, InjectedSettings } from '../decorators';
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
  public static forRoot(): DynamicModule {
    const decorated = [
      ...DynamicRoomProviders.values(),
      ...InjectedSettings.values(),
    ];
    return {
      controllers: [RoomAPIController],
      exports: [...providers, ...decorated],
      global: true,
      imports: [RegisterCache(), DiscoveryModule],
      module: HomeControllerCustomModule,
      providers: [...providers, ...decorated],
    };
  }
}
