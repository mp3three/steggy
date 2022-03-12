import { Bootstrap, BootstrapOptions } from '@automagical/boilerplate';
import { MainCLIService } from '@automagical/tty';
import { show } from 'cli-cursor';

import { SupportToolsModule } from '../projects/support-tools';

const FINISH_BOOTSTRAPPING = 10;

const BOOTSTRAP_OPTIONS = {} as BootstrapOptions;
BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(app => {
  const main = app.get(MainCLIService);
  setTimeout(() => main.exec(), FINISH_BOOTSTRAPPING);
});
Bootstrap(SupportToolsModule, BOOTSTRAP_OPTIONS);
process.addListener('beforeExit', () => show());
