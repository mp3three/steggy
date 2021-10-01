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
  EntityService,
  FanService,
  GroupCommandService,
  HomeCommandService,
  HomeFetchService,
  ImgurAlbumDownloadService,
  LightService,
  LockService,
  MediaService,
  RoomCommandService,
  SwitchService,
} from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [
    UtilitiesModule,
    MainCLIModule,
    ConfigBuilderService,
    DiscoveryModule,
  ],
  providers: [
    ConfigBuilderService,
    ImgurAlbumDownloadService,
    FanService,
    HomeCommandService,
    RoomCommandService,
    MediaService,
    LockService,
    EntityService,
    ClimateService,
    BaseDomainService,
    LightService,
    SwitchService,
    GroupCommandService,
    HomeFetchService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
