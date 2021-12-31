import { INestApplication } from '@nestjs/common';
import { is } from '@text-based/utilities';
import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

import { AcknowledgePrompt } from './acknowledge';
import { CronPrompt } from './cron';
import { ListBuilderPrompt } from './list-builder';
import { MainMenuPrompt } from './main-menu';
import { SelectLinePrompt } from './select-line';
import { ObjectBuilderPrompt } from './settings-builder';
import { TimeoutPrompt } from './timeout';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('cron', CronPrompt);
inquirer.registerPrompt('selectLine', SelectLinePrompt);
inquirer.registerPrompt('timeout', TimeoutPrompt);
inquirer.registerPrompt('mainMenu', MainMenuPrompt);
inquirer.registerPrompt('acknowledge', AcknowledgePrompt);
inquirer.registerPrompt('listbuilder', ListBuilderPrompt);
inquirer.registerPrompt('objectBuilder', ObjectBuilderPrompt);

export function inquirerPreInit(app: INestApplication): void {
  // Slowly bringing inquirer into the DI environment?
  // Maybe.
  const list = [
    CronPrompt,
    SelectLinePrompt,
    TimeoutPrompt,
    MainMenuPrompt,
    AcknowledgePrompt,
    ListBuilderPrompt,
    ObjectBuilderPrompt,
  ] as { onPreInit?: (app: INestApplication) => void }[];
  list.forEach((i) => {
    if (!is.undefined(i.onPreInit)) {
      i.onPreInit(app);
    }
  });
}
