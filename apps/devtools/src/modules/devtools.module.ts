import { DiscoveryModule } from '@nestjs/core';
import { AlpacaModule } from '@text-based/alpaca';
import { MainCLIModule } from '@text-based/tty';
import { ApplicationModule, UtilitiesModule } from '@text-based/utilities';

import { ChangelogService, ImgurAlbumDownloadService } from '../services';
import { AlpacaAccountService } from '../services/alpaca';

@ApplicationModule({
  application: Symbol('devtools'),
  imports: [
    AlpacaModule,
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
  ],
  providers: [
    ImgurAlbumDownloadService,
    ChangelogService,
    AlpacaAccountService,
  ],
})
export class DevtoolsModule {}
