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
  DeployService,
  HomeCommandService,
  HomeFetchService,
  ImgurAlbumDownloadService,
  InspectService,
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
    DeployService,
    HomeCommandService,
    InspectService,
    HomeFetchService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
