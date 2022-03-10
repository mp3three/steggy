import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { CONFIG_APPLICATION_TITLE, MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';
import { GoogleModule } from '@automagical/google';

import {
  CalendarService,
  ChangelogService,
  ImgurAlbumDownloadService,
} from '../services';

@ApplicationModule({
  application: Symbol('devtools'),
  globals: [{ provide: CONFIG_APPLICATION_TITLE, useValue: 'Devtools' }],
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [
    ImgurAlbumDownloadService,
    ChangelogService,
    CalendarService,
    GoogleModule,
  ],
})
export class DevtoolsModule {}
