import { LOG_LEVEL } from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
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
  SolarCalcService,
  TemplateService,
} from '../services';

@LibraryModule({
  exports: [
    TemplateService,
    AutoConfigService,
    LocalsService,
    FetchService,
    AutoLogService,
    SolarCalcService,
  ],
  imports: [CacheModule.register(), DiscoveryModule],
  library: LIB_UTILS,
  providers: [
    TemplateService,
    AutoLogService,
    LocalsService,
    AutoConfigService,
    EventsExplorerService,
    FetchService,
    SolarCalcService,
    LogExplorerService,
  ],
})
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
        LogExplorerService,
        SolarCalcService,
        TemplateService,
        ...decorated,
      ],
      global: true,
      imports: [CacheModule.register(), DiscoveryModule],
      module: UtilitiesModule,
      providers: [
        AutoConfigService,
        AutoLogService,
        FetchService,
        LocalsService,
        LogExplorerService,
        SolarCalcService,
        TemplateService,
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
