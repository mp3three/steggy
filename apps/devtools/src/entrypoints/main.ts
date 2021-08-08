import { MainCLIREPL } from '@automagical/terminal';
import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { DevtoolsModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DevtoolsModule, {
    logger: AutoLogService.nestLogger(),
  });
  const mainCLIService = app.get(MainCLIREPL);
  await mainCLIService.main('DevTools');
  await app.close();
}

bootstrap();
