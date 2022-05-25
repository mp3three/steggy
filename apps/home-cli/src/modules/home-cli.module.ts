import { DiscoveryModule } from '@nestjs/core';
import { ApplicationModule, BoilerplateModule } from '@steggy/boilerplate';
import { TTYModule } from '@steggy/tty';

import {
  ADMIN_KEY,
  APP_TITLE,
  CONTROLLER_API,
  MAX_GRAPH_WIDTH,
  REFRESH_SLEEP,
} from '../config';
import {
  BaseDomainService,
  ClimateService,
  DebugService,
  DeviceService,
  EntityHistoryService,
  EntityService,
  FanGroupCommandService,
  FanService,
  GroupActionService,
  GroupCommandService,
  GroupStateService,
  HomeFetchService,
  KunamiBuilderService,
  LightGroupCommandService,
  LightService,
  LockGroupCommandService,
  LockService,
  MainCLIService,
  MediaService,
  PinnedItemService,
  RoomCommandService,
  RoomStateService,
  RoutineActivateService,
  RoutineCommandBuilderService,
  RoutineCommandService,
  RoutineService,
  ScheduleBuilderService,
  ServerControlService,
  ServerLogsService,
  SolarBuilderService,
  StateChangeBuilderService,
  SwitchGroupCommandService,
  SwitchService,
} from '../services';

@ApplicationModule({
  application: Symbol('home-cli'),
  configuration: {
    [ADMIN_KEY]: {
      description: 'Admin key for the home controller',
      type: 'string',
    },
    [APP_TITLE]: {
      default: 'Home CLI',
      description: 'Header text for when the script first starts',
      type: 'string',
    },
    [CONTROLLER_API]: {
      default: 'http://dev-controller.localhost',
      description: 'API endpoint ',
      type: 'string',
    },
    [MAX_GRAPH_WIDTH]: {
      description: 'Used with ascii charts',
      type: 'number',
    },
    [REFRESH_SLEEP]: {
      default: 100,
      description:
        'Pause time after issuing commands before refreshing state information',
      type: 'number',
    },
  },
  imports: [DiscoveryModule, TTYModule, BoilerplateModule.forRoot()],
  providers: [
    ...[
      // domains/*
      ...[
        BaseDomainService,
        ClimateService,
        FanService,
        LightService,
        LockService,
        MediaService,
        SwitchService,
      ],
      // groups/*
      ...[
        FanGroupCommandService,
        GroupCommandService,
        GroupStateService,
        LightGroupCommandService,
        LockGroupCommandService,
        SwitchGroupCommandService,
      ],
      // rooms/*
      ...[RoomCommandService, RoomStateService],
      // routines/*
      ...[
        GroupActionService,
        RoutineActivateService,
        RoutineCommandService,
        RoutineService,
      ],
      // /*
      ServerControlService,
      ServerLogsService,
      KunamiBuilderService,
      StateChangeBuilderService,
      ScheduleBuilderService,
      RoutineCommandBuilderService,
      SolarBuilderService,
      DebugService,
      MainCLIService,
      PinnedItemService,
      DeviceService,
      EntityHistoryService,
      EntityService,
      HomeFetchService,
    ],
  ],
})
export class HomeCLIModule {}
