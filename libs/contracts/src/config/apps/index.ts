import {
  APP_API_SERVER,
  APP_DEVTOOLS,
  APP_LICENSE_SERVER,
} from '../../constants/library-names';
import {
  APIServerApplicationSettingsDTO,
  DevtoolsApplicationSettingsDTO,
} from '.';

export * from './api-server';
export * from './devtools';
export * from './license-server';

export const CONFIGURABLE_APPS = new Map(
  Object.entries({
    [APP_DEVTOOLS.description]: DevtoolsApplicationSettingsDTO,
    [APP_API_SERVER.description]: APIServerApplicationSettingsDTO,
    [APP_LICENSE_SERVER.description]: DevtoolsApplicationSettingsDTO,
  }),
);
