import { AutomagicalConfig } from '@automagical/config';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';

import { ApplicationSettingsDTO } from '../typings';

export const DEFAULT_SETTINGS: AutomagicalConfig<ApplicationSettingsDTO> = {
  BODY_SIZE: '50mb',
  LOG_LEVEL: 'info',
  PORT: 4001,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  application: {},
  libs: {},
};

export const APP_NAME = APP_HOME_CONTROLLER;
