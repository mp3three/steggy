import { BootstrapOptions } from '@automagical/boilerplate';
import { VersionPrinter } from '@automagical/tty';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: true,
  preInit: [VersionPrinter],
  prettyLog: true,
};
