import { MainCLIService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DevtoolsModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(DevtoolsModule, {
    logger: AutoLogService.nestLogger,
  });
  await app.init();
  const mainCLIService = app.get(MainCLIService);
  await mainCLIService.exec();
  await app.close();
}

bootstrap();
