import { FetchUserdataMiddleware } from '@automagical/formio-sdk';
import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { FetchLicenseMiddleware } from '@automagical/licenses';

async function bootstrap() {
  const prefix = 'license-server';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.setGlobalPrefix(prefix);
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
