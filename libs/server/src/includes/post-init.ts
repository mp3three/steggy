import { INestApplication } from '@nestjs/common';
import { Express } from 'express';

import { BootstrapService } from '../services/bootstrap.service';

export async function ServerPostInit(
  app: INestApplication,
  express: Express,
): Promise<void> {
  const bootstrap = app.get(BootstrapService);
  bootstrap.server = express;
  bootstrap.postInit(app);
}
