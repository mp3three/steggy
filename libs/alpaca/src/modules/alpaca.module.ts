import { LibraryModule, RegisterCache } from '@for-science/utilities';

import { LIB_ALPACA } from '../config';
import { AlpacaFetchService } from '../services';

const providers = [AlpacaFetchService, AlpacaFetchService];
@LibraryModule({
  exports: providers,
  imports: [RegisterCache()],
  library: LIB_ALPACA,
})
export class AlpacaModule {}
