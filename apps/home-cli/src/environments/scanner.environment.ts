import { BootstrapOptions, ScanConfig } from '@steggy/boilerplate';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  config: { libs: { boilerplate: { LOG_LEVEL: 'silent' } } },
  nestNoopLogger: true,
  preInit: [
    app => {
      console.log(JSON.stringify(ScanConfig(app)));
      process.exit();
    },
  ],
};
