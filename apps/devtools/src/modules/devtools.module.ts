import { MainCLIModule } from '@for-science/tty';
import { ApplicationModule, UtilitiesModule } from '@for-science/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { ChangelogService, ImgurAlbumDownloadService } from '../services';
import { AlpacaTestSerivce } from '../services/alpaca';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [ImgurAlbumDownloadService, ChangelogService, AlpacaTestSerivce],
})
export class DevtoolsModule {}
