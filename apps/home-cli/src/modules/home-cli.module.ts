import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { MainCLIModule } from '@automagical/tty';
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
  RestoreService,
  RoomCommandService,
  RoomStateService,
  RoutineActivateService,
  RoutineCaptureService,
  RoutineCommandService,
  RoutineService,
  RoutineTriggerService,
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
  application: Symbol('home-cli'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
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
        RoutineTriggerService,
        RestoreService,
        RoutineCaptureService,
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
