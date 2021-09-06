import { LIB_PORTAINER } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';

import { CONFIG } from '../config';

@LibraryModule({
  config: CONFIG,
  controllers: [],
  exports: [],
  library: LIB_PORTAINER,
  providers: [],
})
export class PortainerModule {}
