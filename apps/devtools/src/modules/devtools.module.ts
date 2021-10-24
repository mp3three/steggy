import { MainCLIModule } from '@automagical/tty';
import {
  APP_DEVTOOLS,
  ApplicationModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  BaseDomainService,
  ChangelogService,
  ClimateService,
  ConfigBuilderService,
  DebugService,
  DeviceService,
  EntityService,
  FanService,
  GroupCommandService,
  GroupStateService,
  HomeFetchService,
  ImgurAlbumDownloadService,
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
  application: APP_DEVTOOLS,
  imports: [
    ConfigBuilderService,
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule,
  ],
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
        RoutineCommandService,
        ScheduleBuilderService,
        StateChangeBuilderService,
        KunamiBuilderService,
      ],
    ],
    ...[ChangelogService, ConfigBuilderService],
    ...[ImgurAlbumDownloadService],
  ],
})
export class DevtoolsModule {}
