/* eslint-disable @typescript-eslint/require-await */
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BootstrapOptions } from '@steggy/boilerplate';
import { ConnectService, MongoPersistenceModule } from '@steggy/persistence';
import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { DEFAULT_CONFIG } from './default-config';

export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => ({
  config: DEFAULT_CONFIG,
  http: true,
  imports: [
    MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule],
      inject: [ConnectService],
      useFactory: async (connect: ConnectService) => await connect.build(),
    }),
  ],
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
