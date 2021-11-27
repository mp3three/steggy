import {
  LIB_CONTROLLER_LOGIC,
  LibraryModule,
  RegisterCache,
} from '@ccontour/utilities';
import { DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DynamicRoomProviders, InjectedSettings } from '../decorators';
import {
  CircadianService,
  EntityCommandRouterService,
  FanGroupService,
  FlashAnimationService,
  GroupService,
  KunamiCodeActivateService,
  LatchCommandService,
  LightFlashCommandService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  RoomService,
  RoutineService,
  ScheduleActivateService,
  SendNotificationService,
  SolarActivateService,
  SolarCalcService,
  StateChangeActivateService,
  SwitchGroupService,
  WebhookService,
} from '../services';
import { HomePersistenceModule } from './home-persistence.module';

const providers = [
  ...[SendNotificationService, WebhookService],
  ...[
    FanGroupService,
    GroupService,
    LightGroupService,
    LockGroupService,
    SwitchGroupService,
  ],
  ...[
    ScheduleActivateService,
    KunamiCodeActivateService,
    StateChangeActivateService,
    LatchCommandService,
    SolarActivateService,
    RoutineService,
  ],
  ...[
    FlashAnimationService,
    LightFlashCommandService,
    CircadianService,
    LightManagerService,
    SolarCalcService,
  ],
  EntityCommandRouterService,
  RoomService,
];

@LibraryModule({
  exports: providers,
  imports: [RegisterCache(), DiscoveryModule, HomePersistenceModule],
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
      imports: [RegisterCache(), DiscoveryModule, HomePersistenceModule],
      module: HomeControllerCustomModule,
      providers: [...providers, ...decorated],
    };
  }
}
