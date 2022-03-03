import { ApplicationModule, UtilitiesModule } from '@automagical/boilerplate';
import { MainCLIModule } from '@automagical/tty';
import { DiscoveryModule } from '@nestjs/core';

import { OfflineLicenseService } from '../services';

@ApplicationModule({
  application: Symbol('support-tools'),
  imports: [DiscoveryModule, MainCLIModule, UtilitiesModule.forRoot()],
  providers: [OfflineLicenseService],
})
export class SupportToolsModule {}
