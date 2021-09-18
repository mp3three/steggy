import { CacheModule, DynamicModule, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_UTILS } from '../contracts';
import { injectedLoggers } from '../decorators/injectors';
import { CONFIG_PROVIDERS } from '../decorators/injectors/inject-config.decorator';
import { LibraryModule } from '../decorators/library-module.decorator';
import {
  AutoConfigService,
  AutoLogService,
  CacheProviderService,
  EventsExplorerService,
  FetchService,
  LifecycleService,
  LogExplorerService,
  ModuleScannerService,
  ScheduleExplorerService,
} from '../services';

@LibraryModule({
  exports: [
    AutoConfigService,
    CacheProviderService,
    FetchService,
    AutoLogService,
  ],
  imports: [CacheModule.register(), DiscoveryModule],
  library: LIB_UTILS,
  providers: [
    LogExplorerService,
    AutoLogService,
    AutoConfigService,
    LifecycleService,
    ModuleScannerService,
    EventsExplorerService,
    FetchService,
    CacheProviderService,
    ScheduleExplorerService,
  ],
})
export class UtilitiesModule {
  public static forRoot(extra: Provider[] = []): DynamicModule {
    const config = [...CONFIG_PROVIDERS.values()];
    const decorated = [...injectedLoggers.values()];
    return {
      exports: [
        ...extra,
        AutoConfigService,
        AutoLogService,
        ModuleScannerService,
        CacheProviderService,
        FetchService,
        ...config,
        ...decorated,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        ...extra,
        LogExplorerService,
        ModuleScannerService,
        ScheduleExplorerService,
        CacheProviderService,
        EventsExplorerService,
        LifecycleService,
        ...config,
        AutoConfigService,
        AutoLogService,
        FetchService,
        ...decorated,
      ],
    };
  }
}
