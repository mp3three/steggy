import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DashboardModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DashboardModule, {
    logger: AutoLogService.nestLogger(),
  });
  await app.close();
}

bootstrap();
