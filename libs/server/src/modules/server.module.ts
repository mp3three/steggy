import { LIB_SERVER } from '@automagical/contracts';
import {
  AutoConfigService,
  AutoLogService,
  LibraryModule,
} from '@automagical/utilities';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { json } from 'express';
import helmet from 'helmet';

import { CONFIG } from '../config';

@LibraryModule({
  config: CONFIG,
  library: LIB_SERVER,
})
export class ServerModule {
  constructor(
    private readonly logger: AutoLogService,
    private readonly config: AutoConfigService,
  ) {}

  protected configure(consumer: MiddlewareConsumer): void {
    const middleware: ((...parameters: unknown[]) => unknown)[] = [helmet];
    const limit = this.config.get('BODY_SIZE');
    if (limit) {
      middleware.push(json({ limit }));
    }
    consumer
      .apply(...middleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
    this.logger.info(`[ServerModule] added generic middleware`);
  }
}
