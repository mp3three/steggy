import { LibraryModule } from '@text-based/utilities';

import { LIB_RCON } from '../config';
import { RCONConnectionService } from '../services';

@LibraryModule({
  library: LIB_RCON,
  providers: [RCONConnectionService],
})
export class RCONModule {}
