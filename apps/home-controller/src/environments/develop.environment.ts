import { BootstrapOptions } from '@steggy/boilerplate';
import { INestApplication } from '@nestjs/common';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
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
