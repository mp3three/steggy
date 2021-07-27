import { LIB_TERMINAL } from '@automagical/contracts/constants';
import { LoggableModule } from '@automagical/utilities';
import { Global, Module } from '@nestjs/common';

import { ConfigBuilderREPL, MainCLIREPL } from '../repl';
import { SystemService, TypePromptService } from '../services';

@Global()
@Module({
  exports: [SystemService, MainCLIREPL, TypePromptService],
  providers: [SystemService, MainCLIREPL, TypePromptService, ConfigBuilderREPL],
})
@LoggableModule(LIB_TERMINAL)
export class MainCLIModule {}
