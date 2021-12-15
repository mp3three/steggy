import { MainCLIService } from '@for-science/tty';
import { Bootstrap } from '@for-science/utilities';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { DevtoolsModule } from '../modules';

const FINISH_BOOTSTRAPPING = 10;

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push((app) => {
  const main = app.get(MainCLIService);
  setTimeout(() => {
    main.exec();
  }, FINISH_BOOTSTRAPPING);
});
Bootstrap(DevtoolsModule, BOOTSTRAP_OPTIONS);
