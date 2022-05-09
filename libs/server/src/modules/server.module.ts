import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LibraryModule } from '@steggy/boilerplate';

import {
  ADMIN_KEY,
  AUTH_BYPASS,
  BASIC_AUTH_PASSWORD,
  BASIC_AUTH_USERNAME,
  BODY_SIZE,
  COMPRESSION,
  CORS,
  CSURF,
  GLOBAL_PREFIX,
  HIDE_VERSION,
  LIB_SERVER,
  MAX_REQUEST_ID,
  PORT,
  SSL_CERT,
  SSL_KEY,
  SSL_PORT,
  SWAGGER_PATH,
} from '../config';
import { GenericController } from '../controllers';
import { BasicExceptionFilter } from '../filters';
import { AdminKeyGuard, BasicAuthGuard, IsAuthorizedGuard } from '../guards';
import { JSONFilterInterceptor, LoggingInterceptor } from '../interceptors';
import { InitMiddleware } from '../middleware';
import { MiddlewareService, RouteInjector, SwaggerService } from '../services';

@LibraryModule({
  configuration: {
    [ADMIN_KEY]: {
      careful: true,
      description:
        'Leave blank to disable. If this value is provided via x-admin-key header, the request will be authorized as an admin',
      type: 'string',
    },
    [AUTH_BYPASS]: {
      careful: true,
      default: false,
      description: 'Ignore all authentication, and just let requests through',
      type: 'boolean',
    },
    [BASIC_AUTH_PASSWORD]: {
      description:
        'Used to configure BasicAuthGuard. Only utilized if guard is applied in code.',
      type: 'string',
    },
    [BASIC_AUTH_USERNAME]: {
      description:
        'Used to configure BasicAuthGuard. Only utilized if guard is applied in code.',
      type: 'string',
    },
    [BODY_SIZE]: {
      default: '100kb',
      description: 'Max JSON body size',
      type: 'string',
    },
    [COMPRESSION]: {
      default: true,
      description: 'Compress responses before sending',
      type: 'boolean',
    },
    [CORS]: {
      default: '*',
      description:
        'CORS origin for the server. Set to blank to disable middleware',
      type: 'string',
    },
    [CSURF]: {
      default: true,
      description: 'Enable the CSURF middleware',
      type: 'boolean',
    },
    [GLOBAL_PREFIX]: {
      careful: true,
      default: '/api',
      description:
        "Ex: 'api' http://localhost:7000/normal/route/path => http://localhost:7000/api/normal/route/path",
      type: 'string',
    },
    [HIDE_VERSION]: {
      default: false,
      description: 'Disable the /version endpoint',
      type: 'boolean',
    },
    [MAX_REQUEST_ID]: {
      default: 1_000_000_000,
      description: 'Rollover point for request ids',
      type: 'number',
    },
    [PORT]: {
      default: 7000,
      description: 'Set to value > 0 to enable',
      type: 'number',
    },
    [SSL_CERT]: {
      description: 'File path, required if SSL_PORT is active',
      type: 'string',
    },
    [SSL_KEY]: {
      description: 'File path, required if SSL_PORT is active',
      type: 'string',
    },
    [SSL_PORT]: {
      description: 'Set to value > 0 to enable',
      type: 'number',
    },
    [SWAGGER_PATH]: {
      default: '/api',
      description: 'Where to access the swagger pages at? Blank to disable',
      type: 'string',
    },
  },
  controllers: [GenericController],
  exports: [RouteInjector, SwaggerService],
  library: LIB_SERVER,
  providers: [
    AdminKeyGuard,
    BasicAuthGuard,
    BasicExceptionFilter,
    GenericController,
    InitMiddleware,
    IsAuthorizedGuard,
    JSONFilterInterceptor,
    LoggingInterceptor,
    MiddlewareService,
    RouteInjector,
    SwaggerService,
  ],
})
export class ServerModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}
