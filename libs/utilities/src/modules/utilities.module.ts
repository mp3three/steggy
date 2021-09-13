import { LIB_UTILS } from '@automagical/contracts';
import { APIRequest, APIResponse } from '@automagical/contracts/server';
import {
  CacheModule,
  DynamicModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { NextFunction } from 'express';
import pinoHttp from 'pino-http';

import { LOG_LEVEL } from '..';
import { CONFIG } from '../config';
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
  SolarCalcService,
} from '../services';

@LibraryModule({
  config: CONFIG,
  exports: [
    AutoConfigService,
    CacheProviderService,
    FetchService,
    AutoLogService,
    SolarCalcService,
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
    SolarCalcService,
    ScheduleExplorerService,
  ],
})
export class UtilitiesModule {
  public static forRoot(): DynamicModule {
    const config = [...CONFIG_PROVIDERS.values()];
    const decorated = [...injectedLoggers.values()];
    return {
      exports: [
        AutoConfigService,
        AutoLogService,
        CacheProviderService,
        FetchService,
        ...config,
        SolarCalcService,
        ...decorated,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        LogExplorerService,
        ScheduleExplorerService,
        CacheProviderService,
        EventsExplorerService,
        ...config,
        AutoConfigService,
        AutoLogService,
        FetchService,
        SolarCalcService,
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
