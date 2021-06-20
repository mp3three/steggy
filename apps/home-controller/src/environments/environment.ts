import {
  AutomagicalConfig,
  DEFAULT_DB_SECRET,
  DEFAULT_JWT_SECRET,
  DEFAULT_REMOTE_SECRET,
} from '@automagical/config';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';

import { ApplicationSettingsDTO } from '../typings';

export const DEFAULT_SETTINGS: AutomagicalConfig<ApplicationSettingsDTO> = {
  BODY_SIZE: '50mb',
  LOG_LEVEL: 'info',
  PORT: 3003,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  application: {},
  libs: {
    authentication: {
      EXPIRES_IN: 1000,
      JWT_SECRET: DEFAULT_JWT_SECRET,
      REMOTE_SECRET: DEFAULT_REMOTE_SECRET,
    },
    email: {
      CHUNK_SIZE: 100,
    },
    persistence: {
      // TODO: CipherGCMTypes doesn't include this algorithm
      // Unclear if that is a blocking issue, or just a note that it's deprecated
      ALGORITHM: 'aes-256-cbc',
      DB_SECRET: DEFAULT_DB_SECRET,
    },
    utils: {
      MAX_STASH_DEPTH: 20,
    },
  },
};

export const APP_NAME = APP_HOME_CONTROLLER;
