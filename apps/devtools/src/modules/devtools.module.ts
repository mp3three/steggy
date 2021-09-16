import { APP_DEVTOOLS } from '@automagical/utilities';
import { MainCLIModule } from '@automagical/tty';
import { ApplicationModule, UtilitiesModule } from '@automagical/utilities';

import { ConfigBuilderService, ImgurAlbumDownloadService } from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [
    UtilitiesModule,
    MainCLIModule,
    ConfigBuilderService,
    ImgurAlbumDownloadService,
  ],
})
export class DevtoolsModule {}
