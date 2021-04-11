import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import helmet from 'helmet';
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
