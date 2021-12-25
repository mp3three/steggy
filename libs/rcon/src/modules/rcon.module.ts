import { LibraryModule } from '@for-science/utilities';

import { LIB_RCON } from '../config';
import { RCONConnectionService } from '../services';

@LibraryModule({
  library: LIB_RCON,
  providers: [RCONConnectionService],
})
export class RCONModule {}
