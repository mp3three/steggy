import { LIB_SERVER, LibraryModule } from '@automagical/utilities';
import {
  INestApplication,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';

import { LoggingInterceptor } from '../interceptors';
import { InitMiddleware } from '../middleware';
import { BootstrapService, RouteInjector } from '../services';
import { RequestLoggerService } from '../services/request-logger.service';

@LibraryModule({
  exports: [RouteInjector],
  library: LIB_SERVER,
  providers: [
    BootstrapService,
    RouteInjector,
    RequestLoggerService,
    LoggingInterceptor,
  ],
})
export class ServerModule {
  protected onPreInit(app: INestApplication): void {
    const interceptor = app.get(LoggingInterceptor);
    app.useGlobalInterceptors(interceptor);
  }
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}
