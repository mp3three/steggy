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

import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  MIN_BRIGHTNESS,
  RECENT_ROUTINE_TTL,
  SAFE_MODE,
  SECRETS,
  SEQUENCE_TIMEOUT,
} from '../config';
import {
  ChronoService,
  CircadianService,
  DebuggerService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  FlashAnimationService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataPersistenceService,
  MetadataService,
  PersonGroupService,
  PersonPersistenceService,
  PersonService,
  RecorderService,
  RoomGroupService,
  RoomPersistenceService,
  RoomService,
  RoutinePersistenceService,
  RoutineService,
  SaveStateService,
  SecretsService,
  SolarCalcService,
  SwitchGroupService,
  VMService,
} from '../services';

const providers = [
  ChronoService,
  CircadianService,
  DebuggerService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  FlashAnimationService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MetadataPersistenceService,
  MetadataService,
  PersonGroupService,
  PersonPersistenceService,
  PersonService,
  RecorderService,
  RoomGroupService,
  RoomPersistenceService,
  RoomService,
  RoutinePersistenceService,
  RoutineService,
  SaveStateService,
  SecretsService,
  SolarCalcService,
  SwitchGroupService,
  VMService,
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
    [SECRETS]: {
      description: 'Key / value pairs ',
      type: 'record',
    },
    [SEQUENCE_TIMEOUT]: {
      default: 1500,
      description:
        'When tracking state changes for a kunami event, another change must happen inside this time window',
      type: 'number',
    },
  },
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
  ],
  providers,
})
export class HomeControllerModule {}
