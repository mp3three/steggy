import { MainCLIModule } from '@automagical/tty';
import {
  APP_HOME_CLI,
  ApplicationModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  BaseDomainService,
  ClimateService,
  DebugService,
  DeviceService,
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
  MediaService,
  RoomActionService,
  RoomCommandService,
  RoomStateService,
  RoutineActivateEventsService,
  RoutineCommandService,
  RoutineService,
  ScheduleBuilderService,
  StateChangeBuilderService,
  SwitchGroupCommandService,
  SwitchService,
} from '../services';

@ApplicationModule({
  application: APP_HOME_CLI,
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule],
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
        KunamiBuilderService,
        RoomActionService,
        RoutineActivateEventsService,
        RoutineCommandService,
        RoutineService,
        ScheduleBuilderService,
        StateChangeBuilderService,
      ],
      // /*
      DebugService,
      DeviceService,
      EntityService,
      HomeFetchService,
    ],
  ],
})
export class HomeCLIModule {}
