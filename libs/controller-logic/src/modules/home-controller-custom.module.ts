import { LIB_CONTROLLER_LOGIC } from '@automagical/contracts/constants';
import { CacheImport, LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';

import {
  LightFlashService,
  LightingControllerService,
  LightManagerService,
} from '../lighting';

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
@LoggableModule(LIB_CONTROLLER_LOGIC)
export class HomeControllerCustomModule {}