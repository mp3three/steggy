import { Global, Module } from '@nestjs/common';

import { ConfigBuilderREPL, MainCLIREPL } from '../repl';
import { SystemService, TypePromptService } from '../services';

@Global()
@Module({
  exports: [SystemService, MainCLIREPL, TypePromptService],
  providers: [SystemService, MainCLIREPL, TypePromptService, ConfigBuilderREPL],
})
export class MainCLIModule {}
