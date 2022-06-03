import { BootstrapOptions, ScanConfig } from '@steggy/boilerplate';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { exit } from 'process';

import { DEFAULT_CONFIG } from './default-config';

/**
 * This file should only be utilized during docker builds, where a cached version of the config scan is created.
 *
 * The process for the `home-controller` is slightly weird though.
 * `@nestjs/mongoose` opens the mongo connection IMMEDIATELY, prior to `app.init` getting called.
 * That means, unless the app can reach out to any mongo instance at all, it will all crash before `preInit` gets called.
 *
 * This is the work around to that.
 * Create a temporary mongo in-memory mongo instance, and force the app to connect to that.
 * All user configurations are ignored (and ideally, don't even exist in the first place).
 * Just a new mongo instance, on a random available port, that makes the other code happy so we can scan.
 *
 * **NOTE:** This STILL requires access to a mongodb binary.
 * The memory server automatically installs one for *most* situations.
 * `alpine` based images don't work though (ex: `node:16-alpine`).
 * Moving over to a different base can fix pipelines though (ex: `node:16`)
 */
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
