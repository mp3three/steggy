import { MainCLIService } from '@automagical/tty';
import { Bootstrap } from '@automagical/boilerplate';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { HomeCLIModule } from '../modules';

const FINISH_BOOTSTRAPPING = 10;

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(app => {
  const main = app.get(MainCLIService);
  setTimeout(() => {
    main.exec();
  }, FINISH_BOOTSTRAPPING);
});
Bootstrap(HomeCLIModule, BOOTSTRAP_OPTIONS);
