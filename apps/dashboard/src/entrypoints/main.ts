import { SetTrace, sleep } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DashboardModule } from '../modules';
import { DashboardService } from '../services/dashboard.service';

const noop = () => {
  return;
};
async function bootstrap() {
  SetTrace(false);
  await sleep(1000);
  const app = await NestFactory.createApplicationContext(DashboardModule, {
    // logger: {
    //   error: noop,
    //   log: noop,
    //   warn: noop,
    // },
  });
  const mainCLIService = app.get(DashboardService);
  await mainCLIService.exec();
  await app.close();
}

bootstrap();
