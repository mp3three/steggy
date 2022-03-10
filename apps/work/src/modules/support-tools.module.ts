import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { FormioSdkModule } from '@automagical/formio';
import { MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';
import { OfflineLicenseService, PDFDownloader } from '../services';

@ApplicationModule({
  application: Symbol('support-tools'),
  imports: [
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
    FormioSdkModule,
  ],
  providers: [OfflineLicenseService],
})
export class SupportToolsModule {}
