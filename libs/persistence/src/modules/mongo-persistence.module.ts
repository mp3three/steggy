import { LibraryModule } from '@automagical/boilerplate';

import { LIB_PERSISTENCE } from '../config';
import { ConnectService, EncryptionService } from '../services';

const providers = [ConnectService, EncryptionService];

@LibraryModule({
  exports: providers,
  library: LIB_PERSISTENCE,
  providers: [...providers],
})
export class MongoPersistenceModule {}
