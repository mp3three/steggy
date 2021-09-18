import { AutoConfigService, AutoLogService } from '@automagical/utilities';
import { INestApplication } from '@nestjs/common';
import compression from 'compression';
import express, { json } from 'express';
import { readFileSync } from 'fs';
import helmet from 'helmet';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';

import {
  BODY_SIZE,
  COMPRESSION,
  GLOBAL_PREFIX,
  PORT,
  SSL_CERT,
  SSL_KEY,
  SSL_PORT,
} from '../config';

export async function ServerPreInit(app: INestApplication): Promise<void> {
  const server = express();
  const logger = app.get(AutoLogService);
  const config = app.get(AutoConfigService);
  const prefix = config.get(GLOBAL_PREFIX);
  //
  app.use(helmet());
  if (prefix) {
    app.setGlobalPrefix(prefix);
  }

  const limit = config.get(BODY_SIZE);
  if (limit) {
    app.use(json({ limit }));
  }
  if (config.get(COMPRESSION)) {
    app.use(compression());
  }
  const port = Number(config.get(PORT));
  if (port) {
    createServer(server).listen(port, () =>
      logger.info(`Listening on ${port} (http)`),
    );
  } else {
    logger.warn(`Server not listening for non-ssl http requests`);
  }
  const ssl_port = Number(config.get(SSL_PORT));
  if (!ssl_port) {
    return;
  }
  const key = readFileSync(config.get(SSL_KEY), 'utf-8');
  const cert = readFileSync(config.get(SSL_CERT), 'utf-8');
  if (!key) {
    throw new Error(`Bad ssl key`);
  }
  if (!cert) {
    throw new Error(`Bad ssl cert`);
  }
  createHttpsServer(
    {
      cert,
      key,
    },
    server,
  ).listen(ssl_port, () => logger.info(`Listening on ${ssl_port} (https)`));
}
