import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { FormioSdkModule } from '@automagical/formio';
import { CONFIG_APPLICATION_TITLE, MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import { OfflineLicenseService } from './offline-license.service';

@ApplicationModule({
  application: Symbol('support-tools'),
  globals: [{ provide: CONFIG_APPLICATION_TITLE, useValue: 'FARM.IO' }],
  imports: [
    DiscoveryModule,
    MainCLIModule,
    UtilitiesModule.forRoot(),
    FormioSdkModule,
  ],
  providers: [OfflineLicenseService],
})
export class SupportToolsModule {}
