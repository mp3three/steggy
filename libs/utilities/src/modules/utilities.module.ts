import { LIB_UTILS } from '@automagical/contracts/constants';
import { CacheModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LoggableModule } from '..';
import {
  AutoConfigService,
  FetchService,
  LocalsService,
  LogExplorerService,
  SolarCalcService,
  TemplateService,
} from '../services';

@Global()
@Module({
  exports: [TemplateService, AutoConfigService, LocalsService, FetchService, SolarCalcService],
  imports: [CacheModule.register(), DiscoveryModule],
  providers: [
    TemplateService,
    LocalsService,
    AutoConfigService,
    FetchService,
    SolarCalcService,
    LogExplorerService,
  ],
})
@LoggableModule(LIB_UTILS)
export class UtilitiesModule {}
