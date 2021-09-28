import { MainCLIModule } from '@automagical/tty';
import {
  APP_DEVTOOLS,
  ApplicationModule,
  UtilitiesModule,
} from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  ChangelogService,
  ConfigBuilderService,
  EntityService,
  GroupCommandService,
  HomeCommandService,
  HomeFetchService,
  ImgurAlbumDownloadService,
  RoomCommandService,
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
    HomeCommandService,
    RoomCommandService,
    EntityService,
    GroupCommandService,
    HomeFetchService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
