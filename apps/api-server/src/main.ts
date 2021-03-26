/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import * as helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const prefix = 'api-server';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.setGlobalPrefix(prefix);
  app.use(cors(), helmet());
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
