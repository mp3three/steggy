import { CacheModule, Global, Module } from '@nestjs/common';

import {
  FetchService,
  LocalsService,
  SolarCalcService,
  TemplateService,
} from '../services';

@Global()
@Module({
  exports: [TemplateService, LocalsService, FetchService, SolarCalcService],
  imports: [CacheModule.register()],
  providers: [TemplateService, LocalsService, FetchService, SolarCalcService],
})
export class UtilitiesModule {}
