/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { log } from 'node:console';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = Logger.forNest('home-controller');
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
