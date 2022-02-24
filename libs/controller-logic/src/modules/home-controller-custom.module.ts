import { LibraryModule, RegisterCache } from '@automagical/boilerplate';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_CONTROLLER_LOGIC } from '../config';
import {
  CaptureCommandService,
  CircadianService,
  EntityCommandRouterService,
  FanGroupService,
  FlashAnimationService,
  GroupService,
  KunamiCodeActivateService,
  LightFlashCommandService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataService,
  RoomService,
  RoutineService,
  RoutineTriggerService,
  ScheduleActivateService,
  SendNotificationService,
  SleepCommandService,
  SolarActivateService,
  SolarCalcService,
  StateChangeActivateService,
  StopProcessingCommandService,
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
    CaptureCommandService,
    SolarActivateService,
    RoutineService,
  ],
  ...[
    FlashAnimationService,
    LightFlashCommandService,
    CircadianService,
    RoutineTriggerService,
    LightManagerService,
    StopProcessingCommandService,
    SleepCommandService,
    SolarCalcService,
  ],
  EntityCommandRouterService,
  MetadataService,
  RoomService,
];

@LibraryModule({
  exports: providers,
  imports: [RegisterCache(), DiscoveryModule, HomePersistenceModule],
  library: LIB_CONTROLLER_LOGIC,
  providers,
})
export class HomeControllerCustomModule {}
