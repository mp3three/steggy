import {
  APP_DASHBOARD,
  APP_DEVTOOLS,
  APP_HOME_CONTROLLER,
} from '@automagical/contracts';
import { ClassConstructor } from 'class-transformer';

import { DashboardModule } from '../../../dashboard/src/modules/dashboard.module';
import { HomeControllerModule } from '../../../home-controller/src/modules/application.module';
import { DevtoolsModule } from '../modules';

/**
 * Currently the best / only realistic way found to aggregating all the root level modules
 *
 * Dynamic imports don't work for this. It's complicated and annoying
 */
export const CONFIGURABLE_MODULES = new Map<string, ClassConstructor<unknown>>([
  [APP_HOME_CONTROLLER.description, HomeControllerModule],
  [APP_DASHBOARD.description, DashboardModule],
  [APP_DEVTOOLS.description, DevtoolsModule],
]);
