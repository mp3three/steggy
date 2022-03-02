import { MainCLIService } from '@automagical/tty';
import { Bootstrap } from '@automagical/utilities';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { DevtoolsModule } from '../modules';

const FINISH_BOOTSTRAPPING = 10;

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(app => {
  const main = app.get(MainCLIService);
  setTimeout(() => {
    main.exec();
  }, FINISH_BOOTSTRAPPING);
});
Bootstrap(DevtoolsModule, BOOTSTRAP_OPTIONS);
