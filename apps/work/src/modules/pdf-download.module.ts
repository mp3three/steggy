import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { FormioSdkModule } from '@automagical/formio';
import { CONFIG_APPLICATION_TITLE, MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import { PDFDownloader } from '../services';

@ApplicationModule({
  application: Symbol('pdf-downloader'),
  globals: [{ provide: CONFIG_APPLICATION_TITLE, useValue: 'Exporter' }],
  imports: [
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
    FormioSdkModule,
  ],
  providers: [PDFDownloader],
})
export class PDFDownloadModule {}
