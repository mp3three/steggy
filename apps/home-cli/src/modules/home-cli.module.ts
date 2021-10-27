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
  RoomCommandService,
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
      ...[
        BaseDomainService,
        ClimateService,
        FanService,
        LightService,
        LockService,
        MediaService,
        SwitchService,
      ],
      ...[GroupCommandService, GroupStateService, LightGroupCommandService],
      DebugService,
      DeviceService,
      EntityService,
      HomeFetchService,
      ...[RoomCommandService],
      ...[
        GroupActionService,
        RoutineCommandService,
        ScheduleBuilderService,
        StateChangeBuilderService,
        KunamiBuilderService,
      ],
    ],
  ],
})
export class HomeCLIModule {}
