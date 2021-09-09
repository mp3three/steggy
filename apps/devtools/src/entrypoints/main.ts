import '../includes/config-loader';

import { AutoLogService, UsePrettyLogger } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';

import { DevtoolsModule } from '../modules';
import { ConfigBuilderService } from '../services';

async function bootstrap() {
  if (chalk.supportsColor) {
    UsePrettyLogger();
  }
  const app = await NestFactory.create(DevtoolsModule, {
    logger: AutoLogService.nestLogger,
  });
  await app.init();
  const scanner = app.get(ConfigBuilderService);
  await scanner.exec();
  await app.close();
}
bootstrap();
