import { Type } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { LibraryModule, RegisterCache } from '@steggy/boilerplate';
import {
  GroupDTO,
  MetadataDTO,
  PersonDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { HomeAssistantModule } from '@steggy/home-assistant';
import { MongoPersistenceModule } from '@steggy/persistence';

import { StopProcessingCommandService } from '../commands';
import {
  CALL_PROXY_DEBUG,
  CIRCADIAN_ENABLED,
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  LIB_CONTROLLER_SDK,
  MIN_BRIGHTNESS,
  RECENT_ROUTINE_TTL,
  SAFE_MODE,
  SECRETS,
  VM_COMMAND_TIMEOUT,
  VM_FETCH_TIMEOUT,
} from '../config';
import {
  BreakoutAPIService,
  ChronoService,
  CircadianService,
  DataAggregatorService,
  DebuggerService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  FlashAnimationService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  HACallTypeGenerator,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MathService,
  MetadataPersistenceService,
  MetadataService,
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
  SaveStateService,
  ScheduleEnabledService,
  SecretsService,
  SolarCalcService,
  SwitchGroupService,
  TypeGeneratorService,
  VMService,
} from '../services';

const providers = [
  BreakoutAPIService,
  ChronoService,
  CircadianService,
  DataAggregatorService,
  DebuggerService,
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  FanGroupService,
  GroupGroupService,
  GroupPersistenceService,
  GroupService,
  HACallTypeGenerator,
  LightGroupService,
  LightManagerService,
  LockGroupService,
  MathService,
  MetadataPersistenceService,
  MetadataService,
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
  SaveStateService,
  SecretsService,
  SolarCalcService,
  StopProcessingCommandService,
  SwitchGroupService,
  TypeGeneratorService,
  VMService,
];

@LibraryModule({
  configuration: {
    [CALL_PROXY_DEBUG]: {
      default: true,
      description:
        'Add debug logs for all calls through the vm call service proxy',
      type: 'boolean',
    },
    [CIRCADIAN_ENABLED]: {
      default: true,
      description:
        'Setting to false will prevent lights from having their temperature managed',
      type: 'boolean',
    },
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
      description: 'Key / value pairs',
      type: 'record',
    },
    [VM_COMMAND_TIMEOUT]: {
      default: 1000,
      description:
        'When evaluating user provided javascript code, this determines maximum runtime',
      type: 'number',
    },
    [VM_FETCH_TIMEOUT]: {
      default: 250,
      description:
        'When evaluating user provided javascript code, this determines maximum runtime',
      type: 'number',
    },
  },
  exports: providers,
  imports: [
    HomeAssistantModule,
    MongoPersistenceModule,
    RegisterCache(),
    MongooseModule.forFeature(
      [GroupDTO, MetadataDTO, PersonDTO, RoomDTO, RoutineDTO].map(
        (i: Type) => ({
          name: i.name,
          schema: SchemaFactory.createForClass(i),
        }),
      ),
    ),
  ],
  library: LIB_CONTROLLER_SDK,
  providers: [
    ...providers,
    FlashAnimationService,
    ScheduleEnabledService,
    // CustomCommandService
  ],
})
export class ControllerSDKModule {}
