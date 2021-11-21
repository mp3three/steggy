import { MainCLIModule } from '@ccontour/tty';
import {
  APP_DEVTOOLS,
  ApplicationModule,
  UtilitiesModule,
} from '@ccontour/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { ConfigBuilderService, ImgurAlbumDownloadService } from '../services';

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule],
  providers: [ConfigBuilderService, ImgurAlbumDownloadService],
})
export class DevtoolsModule {}
