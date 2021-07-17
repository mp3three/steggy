import { CacheModule, Global, Module } from '@nestjs/common';

import {
  EmailerService,
  FetchService,
  LocalsService,
  TemplateService,
  VMService,
} from '../services';

@Global()
@Module({
  exports: [
    TemplateService,
    VMService,
    LocalsService,
    EmailerService,
    FetchService,
  ],
  imports: [CacheModule.register()],
  providers: [
    TemplateService,
    VMService,
    LocalsService,
    EmailerService,
    FetchService,
  ],
})
export class UtilitiesModule {}
