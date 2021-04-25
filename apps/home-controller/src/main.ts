import { ConfigService } from '@nestjs/config';
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
  const config = app.get(ConfigService);
  app.useLogger(logger);
  await app.listen(config.get('PORT'), () => {
    logger.log(`Listening on ${config.get('PORT')}`, 'main.js');
  });
}

bootstrap();
