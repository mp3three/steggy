import { BODY_SIZE, PORT } from '@automagical/contracts/config';
import { AutoConfigService } from '@automagical/utilities';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { Logger, PinoLogger } from 'nestjs-pino';

export const BootstrapLogger = (level = 'debug'): { logger: Logger } => {
  return {
    logger: new Logger(
      new PinoLogger({
        pinoHttp: {
          level,
        },
      }),
      {
        pinoHttp: {
          level,
        },
      },
    ),
  };
};
export const BasicNestLogger = (level = 'debug'): Logger => {
  return new Logger(
    new PinoLogger({
      pinoHttp: {
        level,
      },
    }),
    {
      pinoHttp: {
        level,
      },
    },
  );
};

/**
 * Sets up standardized Fastify bootstrap server
 */
export const StandardBootstrap = async (
  module: unknown,
): Promise<ReturnType<typeof NestFactory.create>> => {
  const app = await NestFactory.create(module, BootstrapLogger());
  process.nextTick(async () => {
    const logger = app.get(Logger);
    const config = app.get(AutoConfigService);
    // const origin = config.get(CORS);
    // if (origin) {
    //   app.enableCors({
    //     origin,
    //   });
    // }
    // app.use(helmet);
    const limit = config.get<number>(BODY_SIZE);
    if (limit) {
      app.use(json({ limit }));
    }
    const port = config.get<number>(PORT);
    await app.listen(port, () => logger.log(`Listening on ${port}`));
  });
  return app;
};
