import { LIB_TTY } from '@automagical/utilities';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { MainCLIService } from '../repl';
import {
  ConfigScannerService,
  ReplExplorerService,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '../services';

@LibraryModule({
  exports: [
    SystemService,
    TypePromptService,
    ConfigScannerService,
    WorkspaceService,
  ],
  imports: [DiscoveryModule],
  library: LIB_TTY,
  providers: [
    SystemService,
    TypePromptService,
    ConfigScannerService,
    ReplExplorerService,
    MainCLIService,
    WorkspaceService,
  ],
})
export class MainCLIModule {}
