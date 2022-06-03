/* eslint-disable @typescript-eslint/require-await */
import { BootstrapOptions } from '@steggy/boilerplate';
import { GLOBAL_PREFIX } from '@steggy/server';

export const BOOTSTRAP_OPTIONS = async (): Promise<BootstrapOptions> => ({
  config: {
    libs: { server: { [GLOBAL_PREFIX]: '/api' } },
  },
  http: true,
  prettyLog: false,
});
