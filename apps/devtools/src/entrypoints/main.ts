import { MainCLIService } from '@automagical/tty';
import { Bootstrap } from '@automagical/utilities';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { DevtoolsModule } from '../modules';

BOOTSTRAP_OPTIONS.preInit ??= [];
BOOTSTRAP_OPTIONS.preInit.push(async (app) => {
  const main = app.get(MainCLIService);
  await main.exec();
});
Bootstrap(DevtoolsModule, BOOTSTRAP_OPTIONS);
