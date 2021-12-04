import { VersionPrinter } from '@ccontour/tty';
import { BootstrapOptions } from '@ccontour/utilities';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: false,
  preInit: [VersionPrinter],
  prettyLog: true,
};
