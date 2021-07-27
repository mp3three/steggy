import { LIB_CUSTOM } from '@automagical/contracts/constants';
import { LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';

import { LightFlashService, LightingControllerService } from '../services';

@Global()
@Module({
  exports: [LightingControllerService, LightFlashService],
  providers: [LightingControllerService, LightFlashService],
})
@LoggableModule(LIB_CUSTOM)
export class HomeControllerCustomModule {}
