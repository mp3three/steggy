import { MainCLIService } from '@automagical/tty';
import { NEST_NOOP_LOGGER, UsePrettyLogger } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';

import { DevtoolsModule } from '../modules';

async function bootstrap() {
  if (chalk.supportsColor) {
    UsePrettyLogger();
  }
  const app = await NestFactory.create(DevtoolsModule, {
    logger: NEST_NOOP_LOGGER,
  });
  await app.init();

  // const scanner = app.get(ConfigBuilderService);
  // await scanner.exec();
  const main = app.get(MainCLIService);
  await main.exec();
  //
  await app.close();
}
bootstrap();
