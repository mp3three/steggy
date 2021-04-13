import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
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
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
