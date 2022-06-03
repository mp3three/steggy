import { Bootstrap } from '@steggy/boilerplate';

import { BOOTSTRAP_OPTIONS } from '../environments/environment';
import { HomeControllerModule } from '../modules';

(async () => Bootstrap(HomeControllerModule, await BOOTSTRAP_OPTIONS()))();
