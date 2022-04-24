import { DynamicModule, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import {
  CACHE_PROVIDER,
  LIB_UTILS,
  LOG_LEVEL,
  REDIS_DEFAULT_TTL,
  REDIS_HOST,
  REDIS_PORT,
} from '../config';
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
  configuration: {
    [CACHE_PROVIDER]: {
      default: 'memory',
      description: 'Redis is preferred if available',
      enum: ['redis', 'memory'],
      type: 'string',
    },
    [LOG_LEVEL]: {
      default: 'info',
      description: 'Minimum log level to process',
      enum: ['info', 'warn', 'debug'],
      type: 'string',
    },
    [REDIS_DEFAULT_TTL]: {
      careful: true,
      default: 86_400,
      description: 'Configuration property for redis connection',
      type: 'number',
    },
    [REDIS_HOST]: {
      default: 'localhost',
      description: 'Configuration property for redis connection',
      type: 'string',
    },
    [REDIS_PORT]: {
      default: 6379,
      description: 'Configuration property for redis connection',
      type: 'number',
    },
  },
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
export class BoilerplateModule {
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
      module: BoilerplateModule,
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
  }
}
