/* eslint-disable @typescript-eslint/require-await */
import { INestApplication } from '@nestjs/common';
import { BootstrapOptions } from '@steggy/boilerplate';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { DEFAULT_CONFIG } from './default-config';

export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => ({
  config: DEFAULT_CONFIG,
  http: true,
  preInit: [
    (app: INestApplication, server: Express) => {
      server.use(
        createProxyMiddleware(['!/api/**'], {
          target: 'http://localhost:4200',
          ws: true,
        }),
      );
    },
  ],
  prettyLog: true,
});
