import { VersionPrinter } from '@text-based/tty';
import { BootstrapOptions } from '@text-based/utilities';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: false,
  preInit: [VersionPrinter],
  prettyLog: true,
};
