import { LIB_TTY } from '@automagical/utilities';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import {
  ColorsService,
  GitService,
  MainCLIService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  SystemService,
  WorkspaceService,
} from '../services';

@LibraryModule({
  exports: [
    ColorsService,
    GitService,
    PinnedItemService,
    PromptService,
    SystemService,
    WorkspaceService,
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
    WorkspaceService,
  ],
})
export class MainCLIModule {}
