import { AutomagicalConfig } from '@automagical/config';
import { BODY_SIZE, PORT } from '@automagical/contracts/constants';
import { ServerSwaggerInit } from '@automagical/documentation';
import { BasicNestLogger } from '@automagical/server';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app/application.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: BasicNestLogger(),
  });
  process.nextTick(async () => {
    ServerSwaggerInit(app);
    const logger = app.get(Logger);
    const config = app.get<ConfigService<AutomagicalConfig>>(ConfigService);
    app.use(helmet());
    const limit = config.get(BODY_SIZE);
    if (limit) {
      app.use(json({ limit }));
    }
    const port = config.get(PORT);
    await app.listen(port, () => logger.log(`Listening on ${port}`));
  });
  return app;
}

bootstrap();
