import { ConfigBuilderService } from '@ccontour/tty';
import { Bootstrap } from '@ccontour/utilities';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { ScannerControllerModule } from '../modules/scanner.module';

const FINISH_BOOTSTRAPPING = 10;

BOOTSTRAP_OPTIONS.postInit ??= [];
BOOTSTRAP_OPTIONS.postInit.push((app) => {
  const main = app.get(ConfigBuilderService);
  setTimeout(() => main.handleConfig(), FINISH_BOOTSTRAPPING);
});
Bootstrap(ScannerControllerModule, BOOTSTRAP_OPTIONS);
