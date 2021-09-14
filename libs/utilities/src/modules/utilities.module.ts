import { LIB_UTILS } from '@automagical/contracts';
import { APIRequest, APIResponse } from '@automagical/contracts/server';
import {
  CacheModule,
  DynamicModule,
  MiddlewareConsumer,
  Provider,
  RequestMethod,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { NextFunction } from 'express';
import pinoHttp from 'pino-http';

import { LOG_LEVEL } from '..';
import { injectedLoggers } from '../decorators/injectors';
import { CONFIG_PROVIDERS } from '../decorators/injectors/inject-config.decorator';
import { LibraryModule } from '../decorators/library-module.decorator';
import { expressContextMiddleware, expressContextSetValue } from '../includes';
import {
  AutoConfigService,
  AutoLogService,
  CacheProviderService,
  EventsExplorerService,
  FetchService,
  LogExplorerService,
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
        ScheduleExplorerService,
        CacheProviderService,
        EventsExplorerService,
        ...config,
        AutoConfigService,
        AutoLogService,
        FetchService,
        ...decorated,
      ],
    };
  }

  constructor(private readonly configService: AutoConfigService) {}

  protected configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        expressContextMiddleware,
        pinoHttp({
          level: this.configService.get([LIB_UTILS, LOG_LEVEL]),
        }),
        bindLoggerMiddleware,
      )
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}

function bindLoggerMiddleware(
  request: APIRequest,
  response: APIResponse,
  next: NextFunction,
) {
  expressContextSetValue('logger', request.log);
  next();
}
