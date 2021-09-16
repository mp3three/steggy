import { LIB_TTY } from '@automagical/utilities';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { MainCLIService } from '../repl';
import {
  ReplExplorerService,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '../services';

@LibraryModule({
  exports: [SystemService, TypePromptService, WorkspaceService],
  imports: [DiscoveryModule],
  library: LIB_TTY,
  providers: [
    SystemService,
    TypePromptService,
    ReplExplorerService,
    MainCLIService,
    WorkspaceService,
  ],
})
export class MainCLIModule {}
