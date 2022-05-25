import { DiscoveryModule } from '@nestjs/core';
import {
  ApplicationModule,
  BoilerplateModule,
  InjectConfig,
} from '@steggy/boilerplate';
import { CONFIG_APPLICATION_TITLE, TTYModule } from '@steggy/tty';

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
  LightGroupCommandService,
  LightService,
  LockGroupCommandService,
  LockService,
  MediaService,
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
  globals: [
    {
      inject: [InjectConfig.inject(APP_TITLE)],
      provide: CONFIG_APPLICATION_TITLE,
      useFactory: (title: string) => title,
    },
  ],
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
      AnimationService,
      KunamiBuilderService,
      StateChangeBuilderService,
      ScheduleBuilderService,
      RoutineCommandBuilderService,
      SolarBuilderService,
      DebugService,
      DeviceService,
      EntityHistoryService,
      EntityService,
      HomeFetchService,
    ],
  ],
})
export class HomeCLIModule {}
