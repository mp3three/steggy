import {
  ApplicationModule,
  AutoConfigService,
  BootstrapOptions,
  ScanConfig,
} from '@ccontour/utilities';

AutoConfigService['USE_SCANNER_ASSETS'] = true;
ApplicationModule.useThisConfig({
  libs: {
    utilities: {
      LOG_LEVEL: 'silent',
    },
  },
});
export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: true,
  preInit: [ScanConfig],
};
