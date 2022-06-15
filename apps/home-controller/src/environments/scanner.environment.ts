import { BootstrapOptions, ScanConfig } from '@steggy/boilerplate';
import { exit } from 'process';

import { DEFAULT_CONFIG } from './default-config';

/**
 * This file should only be utilized during docker builds, where a cached version of the config scan is created.
 */
export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => {
  return await {
    // Logs would just blow up the json output
    config: { libs: { boilerplate: { LOG_LEVEL: 'silent' } } },
    globals: [
      // This is injected in place of the result of `MongooseModule.forRootAsync`
      // It is the minimum provider to make NestJS not freak out prior to the scan.
      // Unlike MongooseModule, this doesn't form a connection to the database
      {
        provide: 'DatabaseConnection',
        useValue: { model: () => undefined },
      },
    ],
    nestNoopLogger: true,
    preInit: [
      app => {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(ScanConfig(app, DEFAULT_CONFIG)));
        exit();
      },
    ],
    skipConfigLoad: true,
  };
};
