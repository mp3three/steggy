import { ApplicationModule, RegisterCache } from '@automagical/boilerplate';
import {
  GroupDTO,
  MetadataDTO,
  RoomDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { QuickConnectModule } from '@automagical/persistence';
import { ServerModule } from '@automagical/server';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';

import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  MIN_BRIGHTNESS,
  NOTIFY_CONNECTION_RESET,
  NOTIFY_UNAVAILABLE_DURATION,
  SAFE_MODE,
  SEQUENCE_TIMEOUT,
  UNAVAILABLE_MONITOR_HOUR,
} from '../config';
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
  ChronoService,
  CircadianService,
  EntityCommandRouterService,
  FanGroupService,
  FlashAnimationService,
  GroupPersistenceService,
  GroupService,
  KunamiCodeActivateService,
  LightFlashCommandService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataPersistenceService,
  MetadataService,
  RoomPersistenceService,
  RoomService,
  RoutineEnabledService,
  RoutinePersistenceService,
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
  UpdateLoggerService,
  WebhookService,
} from '../services';

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
    RoutineEnabledService,
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
  UpdateLoggerService,
  RoomService,
  GroupPersistenceService,
  ChronoService,
  RoutinePersistenceService,
  RoomPersistenceService,
  MetadataPersistenceService,
];

@ApplicationModule({
  application: Symbol('home-controller'),
  configuration: {
    [CIRCADIAN_MAX_TEMP]: {
      default: 5500,
      description:
        'Maximum color temperature for circadian lighting. Used at solar noon',
      type: 'number',
    },
    [CIRCADIAN_MIN_TEMP]: {
      default: 2000,
      description:
        "Minimum color temperature for circadian lighting. Used while it's dark out",
      type: 'number',
    },
    [MIN_BRIGHTNESS]: {
      default: 5,
      description:
        'Enforce a number higher than 1 for min brightness in dimmers. Some lights do weird stuff at low numbers',
      type: 'number',
    },
    [NOTIFY_CONNECTION_RESET]: {
      default: true,
      description:
        'Send a notification when home assistant connection is reset',
      type: 'boolean',
    },
    [NOTIFY_UNAVAILABLE_DURATION]: {
      // 4 hours = 1000 * 60 * 60 * 4
      default: 14_400_000,
      description: 'Raise error if entity is unavailable for this long',
      type: 'number',
    },
    [SAFE_MODE]: {
      default: false,
      description: 'Disable all activation events for routines',
      type: 'boolean',
    },
    [SEQUENCE_TIMEOUT]: {
      default: 1500,
      description:
        'When tracking state changes for a kunami event, another change must happen inside this time window',
      type: 'number',
    },
    [UNAVAILABLE_MONITOR_HOUR]: {
      default: 11,
      description: 'When to send notifications about unavailable entities',
      type: 'number',
    },
  },
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
    HomeAssistantModule,
    RegisterCache(),
    ...QuickConnectModule.forRoot([GroupDTO, RoomDTO, RoutineDTO, MetadataDTO]),
    ...(existsSync(rootPath) ? [ServeStaticModule.forRoot({ rootPath })] : []),
    ServerModule,
  ],
  providers,
})
export class HomeControllerModule {}
