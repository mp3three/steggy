import { LIB_SERVER, LibraryModule } from '@automagical/utilities';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';

import { InitMiddleware } from '../middleware';
import { BootstrapService } from '../services';

@LibraryModule({
  library: LIB_SERVER,
  providers: [BootstrapService],
})
export class ServerModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }
}