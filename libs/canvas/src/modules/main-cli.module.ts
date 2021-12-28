import { LibraryModule, RegisterCache } from '@text-based/utilities';

import { LIB_CANVAS } from '../config';

@LibraryModule({
  exports: [],
  imports: [RegisterCache()],
  library: LIB_CANVAS,
  providers: [],
})
export class CanvasModule {}
