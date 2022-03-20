import { LibraryModule } from '@automagical/boilerplate';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { LIB_SERVER } from '../config';
import { GenericController } from '../controllers';
import { BasicExceptionFilter } from '../filters';
import { AdminKeyGuard, IsAuthorizedGuard } from '../guards';
import { LoggingInterceptor } from '../interceptors';
import { InitMiddleware } from '../middleware';
import { MiddlewareService, RouteInjector, SwaggerService } from '../services';

@LibraryModule({
  controllers: [GenericController],
  exports: [RouteInjector, SwaggerService],
  library: LIB_SERVER,
  providers: [
    AdminKeyGuard,
    BasicExceptionFilter,
    GenericController,
    InitMiddleware,
    IsAuthorizedGuard,
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
