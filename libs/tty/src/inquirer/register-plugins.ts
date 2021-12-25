import { is } from '@text-based/utilities';
import { INestApplication } from '@nestjs/common';
import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import datePrompt from 'inquirer-date-prompt';

import { AcknowledgePrompt } from './acknowledge';
import { ListBuilderPrompt } from './list-builder';
import { MainMenuPrompt } from './main-menu';
import { SelectLinePrompt } from './select-line';
import { TimeoutPrompt } from './timeout';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('autocomplete', autocompletePrompt);
inquirer.registerPrompt('selectLine', SelectLinePrompt);
inquirer.registerPrompt('timeout', TimeoutPrompt);
inquirer.registerPrompt('mainMenu', MainMenuPrompt);
inquirer.registerPrompt('acknowledge', AcknowledgePrompt);
inquirer.registerPrompt('listbuilder', ListBuilderPrompt);

export function inquirerPreInit(app: INestApplication): void {
  // Slowly bringing inquirer into the DI environment?
  // Maybe.
  const list = [
    SelectLinePrompt,
    TimeoutPrompt,
    MainMenuPrompt,
    AcknowledgePrompt,
    ListBuilderPrompt,
  ] as { onPreInit?: (app: INestApplication) => void }[];
  list.forEach((i) => {
    if (!is.undefined(i.onPreInit)) {
      i.onPreInit(app);
    }
  });
}
