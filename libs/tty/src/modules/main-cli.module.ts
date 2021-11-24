import { LIB_TTY } from '@ccontour/utilities';
import { LibraryModule } from '@ccontour/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  ColorsService,
  GitService,
  MainCLIService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  SystemService,
} from '../services';

@LibraryModule({
  exports: [
    ColorsService,
    GitService,
    PinnedItemService,
    PromptService,
    SystemService,
  ],
  imports: [DiscoveryModule],
  library: LIB_TTY,
  providers: [
    ColorsService,
    GitService,
    MainCLIService,
    PinnedItemService,
    PromptService,
    ReplExplorerService,
    SystemService,
  ],
})
export class MainCLIModule {}
