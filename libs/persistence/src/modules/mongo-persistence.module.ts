import { LibraryModule } from '@steggy/boilerplate';

import {
  CIPER_ALGORITHM,
  CIPER_KEY_SIZE,
  CIPHER_SECRET,
  LIB_PERSISTENCE,
  MONGO_CA,
  MONGO_CERT,
  MONGO_CRL,
  MONGO_KEY,
  MONGO_URI,
  SALT_END_SIZE,
  SALT_START_SIZE,
} from '../config';
import {
  BaseMongoService,
  ConnectService,
  EncryptionService,
} from '../services';

const providers = [ConnectService, EncryptionService, BaseMongoService];

@LibraryModule({
  configuration: {
    [CIPER_ALGORITHM]: {
      careful: true,
      default: 'aes-256-cbc',
      description: 'Used with database encryption',
      type: 'string',
    },
    [CIPER_KEY_SIZE]: {
      careful: true,
      default: 32,
      description: 'Used with database encryption',
      type: 'number',
    },
    [CIPHER_SECRET]: {
      careful: true,
      default: 'changeme',
      description: 'Used with database encryption',
      type: 'string',
    },
    [MONGO_CA]: {
      careful: true,
      description:
        'Optional configuration item, used with mongo ssl connections. Provide value as absolute file path',
      type: 'string',
    },
    [MONGO_CERT]: {
      careful: true,
      description:
        'Optional configuration item, used with mongo ssl connections. Provide value as absolute file path',
      type: 'string',
    },
    [MONGO_CRL]: {
      careful: true,
      description:
        'Optional configuration item, used with mongo ssl connections. Provide value as absolute file path',
      type: 'string',
    },
    [MONGO_KEY]: {
      careful: true,
      description:
        'Optional configuration item, used with mongo ssl connections. Provide value as absolute file path',
      type: 'string',
    },
    [MONGO_URI]: {
      default: 'mongodb://localhost:27017/steggy',
      description: 'Mongo connection string',
      type: 'string',
    },
    [SALT_END_SIZE]: {
      careful: true,
      default: 20,
      description: 'Random bytes to add to end of encrypted values',
      type: 'number',
    },
    [SALT_START_SIZE]: {
      careful: true,
      default: 20,
      description: 'Random bytes to add to front of encrypted values',
      type: 'number',
    },
  },
  exports: providers,
  library: LIB_PERSISTENCE,
  providers,
})
export class MongoPersistenceModule {}
