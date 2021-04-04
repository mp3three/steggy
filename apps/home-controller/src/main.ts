import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const prefix = 'home-controller';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT, () => {
    logger.log(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
