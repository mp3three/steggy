import { LIB_TERMINAL } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { MainCLIService } from '../repl';
import {
  ReplExplorerService,
  SystemService,
  TypePromptService,
} from '../services';

@LibraryModule({
  exports: [SystemService, TypePromptService],
  imports: [DiscoveryModule],
  library: LIB_TERMINAL,
  providers: [
    SystemService,
    TypePromptService,
    ReplExplorerService,
    MainCLIService,
  ],
})
export class MainCLIModule {}
