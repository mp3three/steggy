import {
  ApplicationModule,
  BootstrapOptions,
  ScanConfig,
} from '@automagical/utilities';

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
