import { VersionPrinter } from '@for-science/tty';
import { BootstrapOptions } from '@for-science/utilities';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: false,
  preInit: [VersionPrinter],
  prettyLog: true,
};
