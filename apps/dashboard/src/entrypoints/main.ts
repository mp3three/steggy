import { NestFactory } from '@nestjs/core';

import { DashboardModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DashboardModule, {
    // logger,
  });
  await app.close();
}

bootstrap();
