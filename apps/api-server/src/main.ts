import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from 'cors';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const prefix = 'api-server';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger,
    },
  );
  app.useStaticAssets({ root: 'assets/public' });
  app.use(
    cors(),
    helmet(),
    // TODO Environment var?
    json({ limit: '50mb' }),
  );
  await app.listen(process.env.PORT, () => {
    logger.info(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
