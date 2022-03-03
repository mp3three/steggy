import { Bootstrap, BootstrapOptions } from '@automagical/boilerplate';
import { MainCLIService } from '@automagical/tty';

import { SupportToolsModule } from '../modules';

const FINISH_BOOTSTRAPPING = 10;

const BOOTSTRAP_OPTIONS = {} as BootstrapOptions;
BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(app => {
  const main = app.get(MainCLIService);
  setTimeout(() => main.exec(), FINISH_BOOTSTRAPPING);
});
Bootstrap(SupportToolsModule, BOOTSTRAP_OPTIONS);
