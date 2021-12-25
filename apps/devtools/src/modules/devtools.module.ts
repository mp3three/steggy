import { MainCLIModule } from '@text-based/tty';
import { ApplicationModule, UtilitiesModule } from '@text-based/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { ChangelogService, ImgurAlbumDownloadService } from '../services';
import { AlpacaTestSerivce } from '../services/alpaca';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [ImgurAlbumDownloadService, ChangelogService, AlpacaTestSerivce],
})
export class DevtoolsModule {}
