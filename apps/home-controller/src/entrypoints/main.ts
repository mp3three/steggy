import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { Activate } from '../environments/environment';
import { HomeControllerModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(HomeControllerModule, {
    logger: AutoLogService.nestLogger,
  });
  await Activate(app);
  await app.init();
}
bootstrap();
