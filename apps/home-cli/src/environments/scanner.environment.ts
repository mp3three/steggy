import { BootstrapOptions, ScanConfig } from '@steggy/boilerplate';
import { exit } from 'process';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  config: { libs: { boilerplate: { LOG_LEVEL: 'silent' } } },
  nestNoopLogger: true,
  preInit: [
    app => {
      console.log(JSON.stringify(ScanConfig(app)));
      exit();
    },
  ],
};
