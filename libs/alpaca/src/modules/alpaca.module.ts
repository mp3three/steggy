import { LibraryModule, RegisterCache } from '@text-based/utilities';

import { LIB_ALPACA } from '../config';
import { AccountService, AlpacaFetchService, DataService } from '../services';

const providers = [AlpacaFetchService, AccountService, DataService];
@LibraryModule({
  exports: providers,
  imports: [RegisterCache()],
  library: LIB_ALPACA,
})
export class AlpacaModule {}
