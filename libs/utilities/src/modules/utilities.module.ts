import { LIB_UTILS } from '@automagical/contracts';
import {
  CACHE_PROVIDER,
  LOG_LEVEL,
  REDIS_HOST,
  REDIS_PORT,
} from '@automagical/contracts/config';
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

import { injectedLoggers } from '../decorators/injectors';
import { LibraryModule } from '../decorators/library-module.decorator';
import { expressContextMiddleware, expressContextSetValue } from '../includes';
import {
  AutoConfigService,
  AutoLogService,
  EventsExplorerService,
  FetchService,
  LocalsService,
  LogExplorerService,
  ScheduleExplorerService,
  SolarCalcService,
} from '../services';

@LibraryModule(
  {
    exports: [
      AutoConfigService,
      LocalsService,
      FetchService,
      AutoLogService,
      SolarCalcService,
    ],
    imports: [CacheModule.register(), DiscoveryModule],
    library: LIB_UTILS,
    providers: [
      LogExplorerService,
      AutoLogService,
      LocalsService,
      AutoConfigService,
      EventsExplorerService,
      FetchService,
      SolarCalcService,
      ScheduleExplorerService,
    ],
  },
  [LOG_LEVEL, CACHE_PROVIDER, REDIS_HOST, REDIS_PORT],
)
export class UtilitiesModule {
  // #region Public Static Methods

  public static forRoot(): DynamicModule {
    const decorated = [...injectedLoggers.values()];
    return {
      exports: [
        AutoConfigService,
        AutoLogService,
        FetchService,
        LocalsService,
        SolarCalcService,
        ...decorated,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        LogExplorerService,
        ScheduleExplorerService,
        EventsExplorerService,
        AutoConfigService,
        AutoLogService,
        FetchService,
        LocalsService,
        SolarCalcService,
        ...decorated,
      ],
    };
  }

  // #endregion Public Static Methods

  // #region Constructors

  constructor(private readonly configService: AutoConfigService) {}

  // #endregion Constructors

  // #region Protected Methods

  protected configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        expressContextMiddleware,
        pinoHttp({
          level: this.configService.get(LOG_LEVEL),
        }),
        bindLoggerMiddleware,
      )
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }

  // #endregion Protected Methods
}

function bindLoggerMiddleware(
  request: APIRequest,
  response: APIResponse,
  next: NextFunction,
) {
  expressContextSetValue('logger', request.log);
  next();
}
