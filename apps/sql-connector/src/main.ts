import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { json } from 'express';
import helmet from 'fastify-helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { AppService } from './app/services/app.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    // { logger: false },
  );
  const logger = app.get(Logger);
  const config = app.get(ConfigService);
  const appService = app.get(AppService);
  app.useLogger(logger);
  app.enableCors({
    origin: config.get('CORS'),
  });
  app.register(helmet);
  app.use(
    json({ limit: config.get('BODY_SIZE') }),
    AppService.Middleware(appService),
  );
  const port = config.get('PORT');
  await app.listen(port, () => logger.log(`Listening on ${port}`));
}

bootstrap();
