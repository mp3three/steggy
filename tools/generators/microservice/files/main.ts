import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const prefix = 'api-server';
  const logger = Logger.forNest(prefix);

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.setGlobalPrefix(prefix);
  // app.use(cors(), helmet());
  await app.listen(process.env.PORT, () => {
    logger.info(`Listening on ${process.env.PORT}`);
  });
}

bootstrap();
