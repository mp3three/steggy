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

import { StopProcessingCommandService } from '../commands';
import {
  CIRCADIAN_MAX_TEMP,
  CIRCADIAN_MIN_TEMP,
  MIN_BRIGHTNESS,
  RECENT_ROUTINE_TTL,
  SAFE_MODE,
  SECRETS,
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
  RoutineEnabledService,
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
  RoutineEnabledService,
  RoutinePersistenceService,
  RoutineService,
  SaveStateService,
  SecretsService,
  SolarCalcService,
  SwitchGroupService,
  VMService,
  StopProcessingCommandService,
];

@LibraryModule({
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
  },
  exports: providers,
  imports: [
    HomeAssistantModule,
    RegisterCache(),
    MongooseModule.forFeature(
      ([GroupDTO, MetadataDTO, PersonDTO, RoomDTO, RoutineDTO] as Type[]).map(
        i => ({
          name: i.name,
          schema: SchemaFactory.createForClass(i),
        }),
      ),
    ),
  ],
  library: Symbol('controller-sdk'),
  providers: [...providers],
})
export class ControllerSDKModule {}
