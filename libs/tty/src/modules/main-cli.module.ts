import { LIB_TERMINAL } from '@automagical/contracts';
import { LibraryModule } from '@automagical/utilities';

import { ConfigBuilderREPL, MainCLIREPL } from '../repl';
import { SystemService, TypePromptService } from '../services';

@LibraryModule({
  exports: [SystemService, MainCLIREPL, TypePromptService],
  library: LIB_TERMINAL,
  providers: [SystemService, MainCLIREPL, TypePromptService, ConfigBuilderREPL],
})
export class MainCLIModule {}
