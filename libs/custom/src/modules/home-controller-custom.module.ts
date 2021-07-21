import { Global, Module } from '@nestjs/common';

import { LutronPicoService } from '../services';

@Global()
@Module({
  exports: [LutronPicoService],
  providers: [LutronPicoService],
})
export class HomeControllerCustomModule {}
