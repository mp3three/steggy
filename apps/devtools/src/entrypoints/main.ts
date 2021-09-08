import '../includes/config-loader';

import { ConfigScannerService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';

import { CONFIGURABLE_MODULES } from '../includes/config-loader';
import { DevtoolsModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(DevtoolsModule, {
    logger: AutoLogService.nestLogger,
  });
  await app.init();
  const scanner = app.get(ConfigScannerService);
  await scanner.scan(CONFIGURABLE_MODULES.get('home'));
  await app.close();
}
bootstrap();
