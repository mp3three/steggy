import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AsyncStorageMiddleware } from '@automagical/utilities';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.use(AsyncStorageMiddleware);
  await app.listen(process.env.PORT, () => {
    logger.info(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
