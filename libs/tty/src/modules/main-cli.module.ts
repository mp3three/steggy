import { LIB_TTY } from '@automagical/utilities';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { MainCLIService } from '../repl';
import {
  PromptService,
  ReplExplorerService,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '../services';
import { GitService } from '../services/git.service';

@LibraryModule({
  exports: [
    SystemService,
    TypePromptService,
    PromptService,
    WorkspaceService,
    GitService,
  ],
  imports: [DiscoveryModule],
  library: LIB_TTY,
  providers: [
    SystemService,
    TypePromptService,
    PromptService,
    GitService,
    ReplExplorerService,
    MainCLIService,
    WorkspaceService,
  ],
})
export class MainCLIModule {}
