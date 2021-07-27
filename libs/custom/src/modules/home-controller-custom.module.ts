import { LIB_CUSTOM } from '@automagical/contracts/constants';
import { CacheImport, LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';

import {
  LightFlashService,
  LightingControllerService,
  LightManagerService,
} from '../services';

@Global()
@Module({
  exports: [LightingControllerService, LightFlashService, LightManagerService],
  imports: [CacheImport()],
  providers: [
    LightingControllerService,
    LightFlashService,
    LightManagerService,
  ],
})
@LoggableModule(LIB_CUSTOM)
export class HomeControllerCustomModule {}
