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
  EventEmitterService,
  EventsExplorerService,
  FetchService,
  JSONFilterService,
  LifecycleService,
  LogExplorerService,
  ModuleScannerService,
  ScheduleExplorerService,
  WorkspaceService,
} from '../services';

@LibraryModule({
  exports: [
    AutoConfigService,
    CacheProviderService,
    WorkspaceService,
    JSONFilterService,
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
    WorkspaceService,
    ModuleScannerService,
    JSONFilterService,
    EventsExplorerService,
    FetchService,
    EventEmitterService,
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
        EventEmitterService,
        AutoConfigService,
        WorkspaceService,
        AutoLogService,
        JSONFilterService,
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
        JSONFilterService,
        WorkspaceService,
        EventEmitterService,
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
