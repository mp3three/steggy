import { LIB_TERMINAL } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { CONFIG } from '../config';
import { MainCLIService } from '../repl';
import {
  ConfigScannerService,
  ReplExplorerService,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '../services';

@LibraryModule({
  config: CONFIG,
  exports: [
    SystemService,
    TypePromptService,
    ConfigScannerService,
    WorkspaceService,
  ],
  imports: [DiscoveryModule],
  library: LIB_TERMINAL,
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
