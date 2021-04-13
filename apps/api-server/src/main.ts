import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from 'cors';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    // { logger: false },
  );
  const logger = app.get(Logger);
  app.useLogger(logger);
  // app.use(AsyncStorageMiddleware);
  app.useStaticAssets({ root: 'assets/public' });
  app.use(
    cors(),
    helmet(),
    // TODO Environment var?
    json({ limit: '50mb' }),
  );
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
