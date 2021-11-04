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
  FanService,
  GroupActionService,
  GroupCommandService,
  GroupStateService,
  HomeFetchService,
  KunamiBuilderService,
  LightGroupCommandService,
  LightService,
  LockService,
  MediaService,
  RoomActionService,
  RoomCommandService,
  RoomStateService,
  RoutineActivateEventsService,
  RoutineCommandBuilderService,
  RoutineCommandService,
  ScheduleBuilderService,
  StateChangeBuilderService,
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
      ...[GroupCommandService, GroupStateService, LightGroupCommandService],
      // rooms/*
      ...[RoomCommandService, RoomStateService],
      // routines/*
      ...[
        GroupActionService,
        KunamiBuilderService,
        RoomActionService,
        RoutineActivateEventsService,
        RoutineCommandBuilderService,
        RoutineCommandService,
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
