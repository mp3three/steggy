import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { FormioSdkModule } from '@automagical/formio';
import { MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';
import { PDFDownloader } from '../services';

@ApplicationModule({
  application: Symbol('pdf-downloader'),
  imports: [
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
    FormioSdkModule,
  ],
  providers: [PDFDownloader],
})
export class SupportToolsModule {}
