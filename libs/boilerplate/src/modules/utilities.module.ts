import { DynamicModule, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_UTILS } from '../config';
import { LOGGER_PROVIDERS } from '../decorators/injectors';
import { CONFIG_PROVIDERS } from '../decorators/injectors/inject-config.decorator';
import { LibraryModule } from '../decorators/library-module.decorator';
import { RegisterCache } from '../includes';
import {
  AutoConfigService,
  AutoLogService,
  CacheProviderService,
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
    AutoLogService,
    CacheProviderService,
    FetchService,
    JSONFilterService,
    WorkspaceService,
  ],
  imports: [RegisterCache(), DiscoveryModule],
  library: LIB_UTILS,
  providers: [
    AutoConfigService,
    AutoLogService,
    CacheProviderService,
    EventsExplorerService,
    FetchService,
    JSONFilterService,
    LifecycleService,
    LogExplorerService,
    ModuleScannerService,
    ScheduleExplorerService,
    WorkspaceService,
  ],
})
export class UtilitiesModule {
  public static RegisterCache = RegisterCache;
  public static forRoot(extra: Provider[] = []): DynamicModule {
    // @InjectConfig()
    const config = [...CONFIG_PROVIDERS.values()];
    // @InjectLogger()
    const loggers = [...LOGGER_PROVIDERS.values()];
    return {
      exports: [
        ...extra,
        ...config,
        ...loggers,
        AutoConfigService,
        AutoLogService,
        CacheProviderService,
        FetchService,
        JSONFilterService,
        ModuleScannerService,
        WorkspaceService,
      ],
      global: true,
      imports: [RegisterCache(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        ...extra,
        ...config,
        ...loggers,
        AutoConfigService,
        AutoLogService,
        CacheProviderService,
        EventsExplorerService,
        FetchService,
        JSONFilterService,
        LifecycleService,
        LogExplorerService,
        ModuleScannerService,
        ScheduleExplorerService,
        WorkspaceService,
      ],
    };
  }

  constructor(
    private readonly discoveryService: LogExplorerService,
    private readonly logger: AutoLogService,
  ) {}

  protected configure(): void {
    this.discoveryService.load();
    this.logger.info(`Logger contexts initialized`);
  }
}
