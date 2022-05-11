import {
  AutoConfigService,
  BootstrapOptions,
  ScanConfig,
} from '@steggy/boilerplate';

AutoConfigService['USE_SCANNER_ASSETS'] = true;
export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  config: {
    libs: {
      boilerplate: {
        LOG_LEVEL: 'silent',
      },
    },
  },
  nestNoopLogger: true,
  preInit: [ScanConfig],
};
