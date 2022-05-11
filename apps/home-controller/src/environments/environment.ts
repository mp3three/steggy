import { BootstrapOptions } from '@steggy/boilerplate';
import { GLOBAL_PREFIX } from '@steggy/server';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  config: {
    libs: { server: { [GLOBAL_PREFIX]: '/api' } },
  },
  http: true,
  prettyLog: false,
};
