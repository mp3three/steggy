import { BootstrapOptions, ScanConfig } from '@steggy/boilerplate';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exit } from 'process';

import { DEFAULT_CONFIG } from './default-config';

export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => {
  const mongod = await MongoMemoryServer.create();
  const MONGO_URI = mongod.getUri();
  return {
    config: {
      libs: {
        boilerplate: { LOG_LEVEL: 'silent' },
        persistence: { MONGO_URI },
      },
    },
    nestNoopLogger: true,
    preInit: [
      app => {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(ScanConfig(app, DEFAULT_CONFIG)));
        mongod.stop();
        exit();
      },
    ],
    skipConfigLoad: true,
  };
};
