import {
  APP_DEVTOOLS,
  APP_HOME_CONTROLLER,
} from '../../constants/library-names';
import { DevtoolsApplicationSettingsDTO } from './devtools';
import { HomeControllerApplicationSettingsDTO } from './home-controller';

export * from './devtools';
export * from './home-controller';

export const CONFIGURABLE_APPS = new Map(
  Object.entries({
    [APP_DEVTOOLS.description]: DevtoolsApplicationSettingsDTO,
    [APP_HOME_CONTROLLER.description]: HomeControllerApplicationSettingsDTO,
  }),
);
