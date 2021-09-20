import { LIB_SERVER, LibraryModule } from '@automagical/utilities';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { InitMiddleware } from '../middleware';
import { BootstrapService, RouteInjector } from '../services';

@LibraryModule({
  exports: [RouteInjector],
  library: LIB_SERVER,
  providers: [BootstrapService, RouteInjector],
})
export class ServerModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}
