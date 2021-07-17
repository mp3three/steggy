import {
  AutomagicalConfig,
  DEFAULT_ALGORITHM,
  DEFAULT_DB_SECRET,
  DEFAULT_EXPIRES_IN,
  DEFAULT_VERIFY_JWT,
} from '@formio/contracts/config';

export const DEFAULT_TEST_SETTINGS: AutomagicalConfig = {
  BODY_SIZE: '50mb',
  LOG_LEVEL: 'info',
  PORT: 3003,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  SKIP_CONFIG_PRINT: true,
  THROTTLE_LIMIT: 10,
  THROTTLE_TTL: 60,
  libs: {
    authentication: {
      EXPIRES_IN: DEFAULT_EXPIRES_IN,
      JWT_SECRET: 'DEFAULT_JWT_SECRET',
      REMOTE_SECRET: 'DEFAULT_REMOTE_SECRET',
      VERIFY_JWT: DEFAULT_VERIFY_JWT,
    },
    license: {
      LICENSE_KEY: 'yL5js5P5aNxd7hpIsBPumXjdz73P2I',
      _DEV_MODE: true,
    },
    persistence: {
      ALGORITHM: DEFAULT_ALGORITHM,
      DB_SECRET: DEFAULT_DB_SECRET,
    },
    server: {
      COMPRESSION: false,
      RESERVED_WORDS_LIST: [],
    },
    utils: {
      MAX_STASH_DEPTH: 20,
      email: {
        CHUNK_SIZE: 100,
      },
    },
  },
};
