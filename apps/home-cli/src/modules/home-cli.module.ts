import {
  ApplicationModule,
  InjectConfig,
  UtilitiesModule,
} from '@automagical/boilerplate';
import { CONFIG_APPLICATION_TITLE, MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import { APP_TITLE } from '../config';
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
  RoutineCommandBuilderService,
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
  globals: [
    {
      inject: [InjectConfig.inject(APP_TITLE)],
      provide: CONFIG_APPLICATION_TITLE,
      useFactory: (title: string) => title,
    },
  ],
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
        RoutineCommandBuilderService,
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
