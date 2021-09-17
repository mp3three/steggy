import { MainCLIModule } from '@automagical/tty';
import {
  APP_DEVTOOLS,
  ApplicationModule,
  UtilitiesModule,
} from '@automagical/utilities';

import {
  ChangelogService,
  ConfigBuilderService,
  DeployService,
  ImgurAlbumDownloadService,
} from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [UtilitiesModule, MainCLIModule, ConfigBuilderService],
  providers: [
    ConfigBuilderService,
    ImgurAlbumDownloadService,
    DeployService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
