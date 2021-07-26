import { Global, Module } from '@nestjs/common';

import { LightFlashService, LightingControllerService } from '../services';

@Global()
@Module({
  exports: [LightingControllerService, LightFlashService],
  providers: [LightingControllerService, LightFlashService],
})
export class HomeControllerCustomModule {}
