import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { Activate } from '../environments/environment';
import { DashboardModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DashboardModule, {
    logger: AutoLogService.nestLogger,
  });
  await Activate(app);
  await app.close();
}

bootstrap();
