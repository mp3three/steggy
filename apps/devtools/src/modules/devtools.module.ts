import { MainCLIModule } from '@for-science/tty';
import { ApplicationModule, UtilitiesModule } from '@for-science/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { ChangelogService, ImgurAlbumDownloadService } from '../services';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [ImgurAlbumDownloadService, ChangelogService],
})
export class DevtoolsModule {}
