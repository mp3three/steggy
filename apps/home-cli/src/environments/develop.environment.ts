import { BootstrapOptions } from '@automagical/boilerplate';
import { VersionPrinter } from '@automagical/tty';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: false,
  preInit: [VersionPrinter],
  prettyLog: true,
};
