import { LIB_UTILS } from '@automagical/contracts/constants';
import { ACTIVE_APPLICATION } from '@automagical/contracts/utilities';
import {
  CacheModule,
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
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
  exports: [
    TemplateService,
    AutoConfigService,
    LocalsService,
    FetchService,
    SolarCalcService,
  ],
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
export class UtilitiesModule {
  // #region Public Static Methods

  public static forRoot(
    APP_NAME: symbol,
    globalProviders: Provider[] = [],
  ): DynamicModule {
    const ACTIVE_APP = {
      provide: ACTIVE_APPLICATION,
      useValue: APP_NAME,
    };
    return {
      exports: [
        TemplateService,
        AutoConfigService,
        LocalsService,
        FetchService,
        ACTIVE_APP,
        ...globalProviders,
        SolarCalcService,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        TemplateService,
        LocalsService,
        ACTIVE_APP,
        AutoConfigService,
        ...globalProviders,
        FetchService,
        SolarCalcService,
        LogExplorerService,
      ],
    };
  }

  // #endregion Public Static Methods
}
