import { LIB_SERVER } from '@automagical/contracts';
import { BODY_SIZE } from '@automagical/contracts/config';
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
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly config: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected configure(consumer: MiddlewareConsumer): void {
    const middleware: ((...parameters: unknown[]) => unknown)[] = [helmet];
    const limit = this.config.get(BODY_SIZE);
    if (limit) {
      middleware.push(json({ limit }));
    }
    consumer
      .apply(...middleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
    this.logger.info(`[ServerModule] added generic middleware`);
  }

  // #endregion Protected Methods
}
