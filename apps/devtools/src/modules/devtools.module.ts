import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import { ChangelogService, ImgurAlbumDownloadService } from '../services';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [ImgurAlbumDownloadService, ChangelogService],
})
export class DevtoolsModule {}
