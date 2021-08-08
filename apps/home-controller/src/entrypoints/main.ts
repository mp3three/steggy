import { RoomExplorerService } from '@automagical/controller-logic';
import { NestFactory } from '@nestjs/core';
import chalk from 'chalk';
import pino from 'pino';

import { HomeControllerModule } from '../modules';

async function bootstrap() {
  const nestLogger = pino({ level: 'debug' });
  const app = await NestFactory.create(HomeControllerModule, {
    cors: true,
    logger: {
      error: (...parameters) => nestLogger.error(...parameters),
      log: (message, context) =>
        nestLogger.debug(chalk`{bold ${context}}: ${message}`),
      warn: (...parameters) => nestLogger.warn(...parameters),
    },
  });
  const explorer = app.get(RoomExplorerService);
  explorer.application = app;
  await app.init();

  // const logger = app.get(AutoLogService);
  // const config = app.get(AutoConfigService);
  // app.use(helmet());
  // const limit = config.get(BODY_SIZE);
  // if (limit) {
  //   app.use(json({ limit }));
  // }
  // const port = config.get(PORT);
  // await app.listen(port, () => logger.info(`Listening on ${port}`));
}

bootstrap();
