import { FetchUserdataMiddleware } from '@automagical/formio-sdk';
import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const prefix = 'home-controller';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useLogger(logger);
  app.setGlobalPrefix(prefix);
  app.enableShutdownHooks();
  const configService = await app.get(ConfigService);
  console.log(configService.get('application'));
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
