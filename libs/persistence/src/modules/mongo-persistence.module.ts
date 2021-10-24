import { LIB_PERSISTENCE, LibraryModule } from '@automagical/utilities';

import { ConnectService, EncryptionService } from '../services';

const providers = [ConnectService, EncryptionService];

@LibraryModule({
  exports: providers,
  library: LIB_PERSISTENCE,
  providers: [...providers],
})
export class MongoPersistenceModule {}
