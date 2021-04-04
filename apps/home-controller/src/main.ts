import { Logger } from '@automagical/logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Request } from 'express';

async function bootstrap() {
  const prefix = 'home-controller';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.setGlobalPrefix(prefix);
  app.enableShutdownHooks();
  app.use((req: Request, res, next) => {
    console.log('HIT', req.url);
    next();
  });
  const port = 3001 || process.env.PORT;
  await app.listen(port, () => {
    logger.log(`Listening on ${port}`);
  });
}

bootstrap();
