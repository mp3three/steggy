import { ServeStaticModule } from '@nestjs/serve-static';
import { ApplicationModule, RegisterCache } from '@steggy/boilerplate';
import {
  GroupDTO,
  MetadataDTO,
  PersonDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { HomeAssistantModule } from '@steggy/home-assistant';
import { QuickConnectModule } from '@steggy/persistence';
import { ServerModule } from '@steggy/server';
import { existsSync } from 'fs';
import { join } from 'path';

import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  MIN_BRIGHTNESS,
  NODE_RED_URL,
  NOTIFY_CONNECTION_RESET,
  NOTIFY_UNAVAILABLE_DURATION,
  RECENT_ROUTINE_TTL,
  SAFE_MODE,
  SECRETS_FILE,
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
  PersonController,
  RoomController,
  RoutineController,
} from '../controllers';
import {
  ApplicationService,
  AttributeChangeActivateService,
  CaptureCommandService,
  ChronoService,
  CircadianService,
  DebuggerService,
  DeviceTriggerActivateService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  FlashAnimationService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  InternalEventChangeService,
  LightFlashCommandService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataChangeService,
  MetadataPersistenceService,
  MetadataService,
  NodeRedCommand,
  PersonGroupService,
  PersonPersistenceService,
  PersonService,
  RecorderService,
  RoomGroupService,
  RoomPersistenceService,
  RoomService,
  RoutineEnabledService,
  RoutinePersistenceService,
  RoutineService,
  RoutineTriggerService,
  SaveStateService,
  ScheduleActivateService,
  SecretsService,
  SendNotificationService,
  SequenceActivateService,
  SetMetadataService,
  SleepCommandService,
  SolarActivateService,
  SolarCalcService,
  StateChangeActivateService,
  StopProcessingCommandService,
  SwitchGroupService,
  UpdateLoggerService,
  VMService,
  WebhookService,
} from '../services';

const rootPath = join(__dirname, 'ui');

const providers = [
  ApplicationService,
  AttributeChangeActivateService,
  CaptureCommandService,
  ChronoService,
  CircadianService,
  DebuggerService,
  DeviceTriggerActivateService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  FlashAnimationService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  InternalEventChangeService,
  LightFlashCommandService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataChangeService,
  MetadataPersistenceService,
  MetadataService,
  NodeRedCommand,
  PersonGroupService,
  PersonPersistenceService,
  PersonService,
  RecorderService,
  RoomGroupService,
  RoomPersistenceService,
  RoomService,
  RoutineEnabledService,
  RoutinePersistenceService,
  RoutineService,
  RoutineTriggerService,
  SaveStateService,
  ScheduleActivateService,
  SecretsService,
  SendNotificationService,
  SequenceActivateService,
  SetMetadataService,
  SleepCommandService,
  SolarActivateService,
  SolarCalcService,
  StateChangeActivateService,
  StopProcessingCommandService,
  SwitchGroupService,
  UpdateLoggerService,
  VMService,
  WebhookService,
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
    [NODE_RED_URL]: {
      description: 'API target for outgoing node red hooks.',
      type: 'string',
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
    [RECENT_ROUTINE_TTL]: {
      // 3 days (measured in seconds)
      default: 259_200,
      description: 'How long to track recent routine activations for',
      type: 'number',
    },
    [SAFE_MODE]: {
      default: false,
      description: 'Disable all activation events for routines',
      type: 'boolean',
    },
    [SECRETS_FILE]: {
      description:
        'Newline separated token=value. Usable in some substitutions locations, like webhook headers',
      type: 'string',
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
    MetadataController,
    PersonController,
    RoomController,
    RoutineController,
  ],
  imports: [
    HomeAssistantModule,
    RegisterCache(),
    ...QuickConnectModule.forRoot([
      GroupDTO,
      MetadataDTO,
      PersonDTO,
      RoomDTO,
      RoutineDTO,
    ]),
    ...(existsSync(rootPath) ? [ServeStaticModule.forRoot({ rootPath })] : []),
    ServerModule,
  ],
  providers,
})
export class HomeControllerModule {}
