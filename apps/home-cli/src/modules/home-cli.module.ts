import { MainCLIModule } from '@ccontour/tty';
import {
  APP_HOME_CLI,
  ApplicationModule,
  UtilitiesModule,
} from '@ccontour/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  AnimationService,
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
  LightFlashService,
  LightGroupCommandService,
  LightService,
  LockGroupCommandService,
  LockService,
  MediaService,
  RoomCommandService,
  RoomStateService,
  RoutineActivateService,
  RoutineCommandService,
  RoutineService,
  ScheduleBuilderService,
  SendNotificationService,
  ServerControlService,
  ServerLogsService,
  SolarBuilderService,
  StateChangeBuilderService,
  SwitchGroupCommandService,
  SwitchService,
  WebhookService,
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
        LightFlashService,
        RoutineActivateService,
        RoutineCommandService,
        RoutineService,
        ScheduleBuilderService,
        SendNotificationService,
        SolarBuilderService,
        StateChangeBuilderService,
        WebhookService,
      ],
      // /*
      ServerControlService,
      ServerLogsService,
      AnimationService,
      DebugService,
      DeviceService,
      EntityHistoryService,
      EntityService,
      HomeFetchService,
    ],
  ],
})
export class HomeCLIModule {}
