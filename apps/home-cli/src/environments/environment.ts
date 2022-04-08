import { BootstrapOptions } from '@steggy/boilerplate';
import { VersionPrinter } from '@steggy/tty';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: true,
  preInit: [VersionPrinter],
  prettyLog: true,
};
