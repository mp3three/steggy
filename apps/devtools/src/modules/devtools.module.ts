/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { APP_DEVTOOLS, APP_HOME_CONTROLLER } from '@automagical/contracts';
import { ConfigBuilderService, MainCLIModule } from '@automagical/tty';
import { ApplicationModule, UtilitiesModule } from '@automagical/utilities';

import { HomeControllerModule } from '../../../home-controller/src/modules';

ConfigBuilderService.AVAILABLE_APPLICATIONS = new Map([
  [APP_HOME_CONTROLLER.description, HomeControllerModule],
]);

@ApplicationModule({
  application: APP_DEVTOOLS,
  imports: [UtilitiesModule, MainCLIModule, ConfigBuilderService],
})
export class DevtoolsModule {}
