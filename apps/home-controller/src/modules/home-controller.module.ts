import { ApplicationModule, RegisterCache } from '@automagical/boilerplate';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';

import {
  AdminController,
  AnimationController,
  DebugController,
  DeviceController,
  EntityController,
  GroupController,
  MetadataController,
  RoomController,
  RoutineController,
} from '../controllers';
import {
  ApplicationService,
  AvailabilityMonitorService,
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
  SetRoomMetadataService,
  SleepCommandService,
  SolarActivateService,
  SolarCalcService,
  StateChangeActivateService,
  StopProcessingCommandService,
  SwitchGroupService,
  WebhookService,
} from '../services';
import { HomePersistenceModule } from './home-persistence.module';

const rootPath = join(__dirname, 'ui');

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
    SetRoomMetadataService,
    LightManagerService,
    StopProcessingCommandService,
    SleepCommandService,
    SolarCalcService,
  ],
  EntityCommandRouterService,
  MetadataService,
  ApplicationService,
  AvailabilityMonitorService,
  RoomService,
];

@ApplicationModule({
  application: Symbol('home-controller'),
  controllers: [
    AdminController,
    AnimationController,
    DebugController,
    DeviceController,
    EntityController,
    GroupController,
    RoomController,
    RoutineController,
    MetadataController,
  ],
  imports: [
    ServerModule,
    HomeAssistantModule,
    RegisterCache(),
    HomePersistenceModule.forRoot(),
    ...(existsSync(rootPath)
      ? [
          ServeStaticModule.forRoot({
            rootPath,
          }),
        ]
      : []),
  ],
  providers,
})
export class HomeControllerModule {}
