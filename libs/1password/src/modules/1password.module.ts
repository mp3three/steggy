import { LIB_1PASSWORD } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';

import { CONFIG } from '../config';

@LibraryModule({
  config: CONFIG,
  controllers: [],
  exports: [],
  library: LIB_1PASSWORD,
  providers: [],
})
export class OnePasswordModule {}
