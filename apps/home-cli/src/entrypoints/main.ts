import { Bootstrap } from '@steggy/boilerplate';
import { exit } from 'process';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { HomeCLIModule } from '../modules';
import { MainCLIService } from '../services';

const FINISH_BOOTSTRAPPING = 10;

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push(app => {
  const main = app.get(MainCLIService);
  setTimeout(async () => {
    await main.exec();
    await app.close();
    exit();
  }, FINISH_BOOTSTRAPPING);
});
Bootstrap(HomeCLIModule, BOOTSTRAP_OPTIONS);
