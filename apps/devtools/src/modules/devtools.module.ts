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
  ConfigBuilderService,
  EntityService,
  FanService,
  GroupCommandService,
  HomeCommandService,
  HomeFetchService,
  ImgurAlbumDownloadService,
  LightService,
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
    EntityService,
    BaseDomainService,
    LightService,
    SwitchService,
    GroupCommandService,
    HomeFetchService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
