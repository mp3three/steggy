import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { HomeControllerModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(HomeControllerModule, {
    logger: AutoLogService.nestLogger(),
  });
  await app.init();
}
bootstrap();
