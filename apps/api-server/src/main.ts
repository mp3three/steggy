import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { LocalsInitMiddlware } from './app';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    // { logger: false },
  );
  const logger = app.get(Logger);
  const config = app.get(ConfigService);
  app.useLogger(logger);
  app.enableCors({});
  app.useStaticAssets({ root: 'assets/public' });
  app.use(
    helmet(),
    json({ limit: config.get('BODY_SIZE') }),
    LocalsInitMiddlware,
  );
  const port = config.get('PORT');
  await app.listen(port, () => logger.log(`Listening on ${port}`));
}

bootstrap();
