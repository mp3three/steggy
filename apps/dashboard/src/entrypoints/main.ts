import { SetTrace } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DashboardModule } from '../modules';

const noop = () => {
  return;
};
async function bootstrap() {
  SetTrace(false);
  const logger = {
    error: noop,
    log: noop,
    warn: noop,
  };
  const app = await NestFactory.createApplicationContext(DashboardModule, {
    // logger,
  });
  await app.close();
}

bootstrap();
