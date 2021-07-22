import { Global, Module } from '@nestjs/common';

import { LightingControllerService } from '../services';

@Global()
@Module({
  exports: [LightingControllerService],
  providers: [LightingControllerService],
})
export class HomeControllerCustomModule {}
