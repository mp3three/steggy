import { LibraryModule, RegisterCache } from '@for-science/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_CONTROLLER_LOGIC } from '../config';
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
  RoutineTriggerService,
  ScheduleActivateService,
  SendNotificationService,
  SleepCommandService,
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
    RoutineTriggerService,
    LightManagerService,
    SleepCommandService,
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
export class HomeControllerCustomModule {}
