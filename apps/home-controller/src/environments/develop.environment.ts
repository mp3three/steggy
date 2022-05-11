import { INestApplication } from '@nestjs/common';
import { BootstrapOptions } from '@steggy/boilerplate';
import { GLOBAL_PREFIX } from '@steggy/server';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  config: {
    libs: { server: { [GLOBAL_PREFIX]: '/api' } },
  },
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
};
