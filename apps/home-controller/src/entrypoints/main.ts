import { BODY_SIZE, PORT } from '@automagical/contracts/config';
import { RoomExplorerService } from '@automagical/controller-logic';
import { BasicNestLogger } from '@automagical/server';
import { AutoConfigService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { HomeControllerModule } from '../modules';

async function bootstrap() {
  const app = await NestFactory.create(HomeControllerModule, {
    cors: true,
    logger: BasicNestLogger(),
  });
  process.nextTick(async () => {
    const explorer = app.get(RoomExplorerService);
    explorer.application = app;
    await app.init();
    const logger = app.get(Logger);
    const config = app.get(AutoConfigService);
    app.use(helmet());
    const limit = config.get(BODY_SIZE);
    if (limit) {
      app.use(json({ limit }));
    }
    const port = config.get(PORT);
    await app.listen(port, () => logger.log(`Listening on ${port}`));
  });
  return app;
}

bootstrap();
