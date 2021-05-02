import { Module } from '@nestjs/common';

import { FetchService } from './fetch.service';

@Module({
  exports: [FetchService],
  providers: [FetchService],
})
export class FetchModule {}
