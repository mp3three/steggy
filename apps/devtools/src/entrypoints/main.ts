import { MainCLIService } from '@automagical/tty';
import { Bootstrap } from '@automagical/utilities';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { DevtoolsModule } from '../modules';

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(async (app) => {
  const main = app.get(MainCLIService);
  await main.exec();
});
Bootstrap(DevtoolsModule, BOOTSTRAP_OPTIONS);
