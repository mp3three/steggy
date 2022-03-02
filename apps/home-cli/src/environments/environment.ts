import { VersionPrinter } from '@automagical/tty';
import { BootstrapOptions } from '@automagical/boilerplate';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  nestNoopLogger: true,
  preInit: [VersionPrinter],
  prettyLog: true,
};
