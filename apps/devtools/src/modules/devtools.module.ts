import { MainCLIModule } from '@ccontour/tty';
import { ApplicationModule, UtilitiesModule } from '@ccontour/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  ChangelogService,
  ConfigBuilderService,
  ImgurAlbumDownloadService,
} from '../services';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule],
  providers: [
    ConfigBuilderService,
    ImgurAlbumDownloadService,
    ChangelogService,
  ],
})
export class DevtoolsModule {}
