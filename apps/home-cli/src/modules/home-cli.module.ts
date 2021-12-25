import { MainCLIModule } from '@text-based/tty';
import { ApplicationModule, UtilitiesModule } from '@text-based/utilities';
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
  RoutineTriggerService,
  ScheduleBuilderService,
  SendNotificationService,
  ServerControlService,
  ServerLogsService,
  SolarBuilderService,
  StateChangeBuilderService,
  StopProcessingService,
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
        ScheduleBuilderService,
        StopProcessingService,
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
