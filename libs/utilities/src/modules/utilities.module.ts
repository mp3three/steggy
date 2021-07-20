import { CacheModule, Global, Module } from '@nestjs/common';

import { FetchService, LocalsService, TemplateService } from '../services';

@Global()
@Module({
  exports: [TemplateService, LocalsService, FetchService],
  imports: [CacheModule.register()],
  providers: [TemplateService, LocalsService, FetchService],
})
export class UtilitiesModule {}
