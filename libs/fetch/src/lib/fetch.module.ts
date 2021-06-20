import { Global, Module } from '@nestjs/common';

import { FetchService } from './fetch.service';

@Global()
@Module({
  exports: [FetchService],
  providers: [FetchService],
})
export class FetchModule {}
