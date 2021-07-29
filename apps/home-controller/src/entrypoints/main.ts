import { BODY_SIZE, PORT } from '@automagical/contracts/config';
import { BasicNestLogger } from '@automagical/server';
import { AutoConfigService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ApplicationModule } from '../modules';


async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    cors: true,
    logger: BasicNestLogger(),
  });
  process.nextTick(async () => {
    const logger = app.get(Logger);
    const config = app.get(AutoConfigService);
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
