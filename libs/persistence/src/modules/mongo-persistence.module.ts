import { LibraryModule } from '@automagical/boilerplate';

import {
  CIPER_ALGORITHM,
  CIPER_KEY_SIZE,
  CIPHER_SECRET,
  LIB_PERSISTENCE,
  SALT_END_SIZE,
  SALT_START_SIZE,
} from '../config';
import { ConnectService, EncryptionService } from '../services';

const providers = [ConnectService, EncryptionService];

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
  providers: [...providers],
})
export class MongoPersistenceModule {}
