import { ACTIVE_APPLICATION } from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
import {
  CacheModule,
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { createProvidersForDecorated } from '../decorators';
import { LoggableModule } from '../decorators/logger/loggable-module.decorator';
import {
  AutoConfigService,
  AutoLogService,
  FetchService,
  LocalsService,
  LogExplorerService,
  SolarCalcService,
  TemplateService,
} from '../services';

@Global()
@Module({
  exports: [
    TemplateService,
    AutoConfigService,
    LocalsService,
    FetchService,
    AutoLogService,
    SolarCalcService,
  ],
  imports: [CacheModule.register(), DiscoveryModule],
  providers: [
    TemplateService,
    AutoLogService,
    LocalsService,
    AutoConfigService,
    FetchService,
    SolarCalcService,
    LogExplorerService,
  ],
})
@LoggableModule(LIB_UTILS)
export class UtilitiesModule {
  // #region Public Static Methods

  public static forRoot(): DynamicModule {
    const decorated = createProvidersForDecorated();
    return {
      exports: [
        TemplateService,
        AutoConfigService,
        AutoLogService,
        ...decorated,
        LocalsService,
        FetchService,
        SolarCalcService,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        TemplateService,
        ...decorated,
        LocalsService,
        AutoConfigService,
        AutoLogService,
        FetchService,
        SolarCalcService,
        LogExplorerService,
      ],
    };
  }

  // #endregion Public Static Methods
}
