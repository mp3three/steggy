import {
  LibraryModule,
  LIB_CONTROLLER_LOGIC,
  RegisterCache,
} from '@automagical/utilities';
import { DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DynamicRoomProviders, InjectedSettings } from '../decorators';
import {
  CircadianService,
  GroupService,
  KunamiCodeService,
  LightManagerService,
  RemoteAdapterService,
  RoomExplorerService,
  RoomManagerService,
  SolarCalcService,
  StateManagerService,
} from '../services';

const providers = [
  LightManagerService,
  CircadianService,
  RemoteAdapterService,
  RoomExplorerService,
  StateManagerService,
  SolarCalcService,
  GroupService,
  KunamiCodeService,
  RoomManagerService,
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
      exports: [...providers, ...decorated],
      global: true,
      imports: [RegisterCache(), DiscoveryModule],
      module: HomeControllerCustomModule,
      providers: [...providers, ...decorated],
    };
  }
}
