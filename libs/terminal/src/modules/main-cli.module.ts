import { DynamicModule, Provider } from '@nestjs/common';
import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

import { MainCLIREPL } from '../repl';
import { SystemService } from '../services';

// This seems to be the correct way to load the plugin
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
inquirer.registerPrompt('date', datePrompt);

export class MainCLIModule {
  // #region Public Static Methods

  public static selectServices(
    repl: Provider[],
    service: Provider[] = [],
  ): DynamicModule {
    repl.push(MainCLIREPL);
    return {
      exports: repl,
      global: true,
      imports: [],
      module: MainCLIModule,
      providers: [...repl, ...service, SystemService],
    };
  }

  // #endregion Public Static Methods
}
