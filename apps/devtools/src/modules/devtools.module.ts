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
  ImgurAlbumDownloadService,
} from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule],
  providers: [
    ...[ChangelogService, ConfigBuilderService],
    ...[ImgurAlbumDownloadService],
  ],
})
export class DevtoolsModule {}
