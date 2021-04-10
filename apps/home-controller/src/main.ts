import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AsyncStorageMiddleware } from '@automagical/utilities';

async function bootstrap() {
  const prefix = 'home-controller';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger,
    },
  );
  app.use(AsyncStorageMiddleware);
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
