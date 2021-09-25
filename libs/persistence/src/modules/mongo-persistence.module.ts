import { LIB_PERSISTENCE, LibraryModule } from '@automagical/utilities';

import { ConnectService } from '../services';

const providers = [ConnectService];

@LibraryModule({
  exports: providers,
  library: LIB_PERSISTENCE,
  providers: [...providers],
})
export class MongoPersistenceModule {}
