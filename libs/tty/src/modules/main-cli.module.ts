import { LibraryModule, RegisterCache } from '@ccontour/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_TTY } from '../config';
import {
  ColorsService,
  ConfigBuilderService,
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
    ConfigBuilderService,
    SystemService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    ColorsService,
    GitService,
    MainCLIService,
    PinnedItemService,
    ConfigBuilderService,
    PromptService,
    ReplExplorerService,
    SystemService,
  ],
})
export class MainCLIModule {}
