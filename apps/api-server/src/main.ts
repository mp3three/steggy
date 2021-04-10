import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from 'cors';
import * as helmet from 'helmet';
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
  app.use(cors(), helmet());
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
