import { AutomagicalConfig } from '@automagical/contracts/config';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';

export const DEFAULT_SETTINGS: AutomagicalConfig = {
  application: {},
  common: {
    BODY_SIZE: '50mb',
    LOG_LEVEL: 'info',
    PORT: 4001,
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
  },
  libs: {},
};

export const APP_NAME = APP_HOME_CONTROLLER;
