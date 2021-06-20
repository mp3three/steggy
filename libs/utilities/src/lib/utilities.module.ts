import { CacheModule, Global, Module } from '@nestjs/common';

import { LocalsService, TemplateService, VMService } from './services';

@Global()
@Module({
  exports: [TemplateService, VMService, LocalsService],
  imports: [CacheModule.register()],
  providers: [TemplateService, VMService, LocalsService],
})
export class UtilitiesModule {}
