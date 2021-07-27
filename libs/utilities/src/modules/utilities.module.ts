import { LIB_UTILS } from '@automagical/contracts/constants';
import { CacheModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LoggableModule } from '..';
import {
  FetchService,
  LocalsService,
  LogExplorerService,
  SolarCalcService,
  TemplateService,
} from '../services';

@Global()
@Module({
  exports: [TemplateService, LocalsService, FetchService, SolarCalcService],
  imports: [CacheModule.register(), DiscoveryModule],
  providers: [
    TemplateService,
    LocalsService,
    FetchService,
    SolarCalcService,
    LogExplorerService,
  ],
})
@LoggableModule(LIB_UTILS)
export class UtilitiesModule {}
