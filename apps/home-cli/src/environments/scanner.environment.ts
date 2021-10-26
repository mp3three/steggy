import { BootstrapOptions, ScanConfig } from '@automagical/utilities';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: true,
  preInit: [ScanConfig],
};
