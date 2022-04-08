import { is } from '@steggy/utilities';
import { INestApplication } from '@nestjs/common';
import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

import { CronPrompt } from './cron';
import { SelectLinePrompt } from './select-line';
import { TimeoutPrompt } from './timeout';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('cron', CronPrompt);
inquirer.registerPrompt('selectLine', SelectLinePrompt);
inquirer.registerPrompt('timeout', TimeoutPrompt);

export function inquirerPreInit(app: INestApplication): void {
  // Slowly bringing inquirer into the DI environment?
  // Maybe.
  const list = [CronPrompt, SelectLinePrompt, TimeoutPrompt] as {
    onPreInit?: (app: INestApplication) => void;
  }[];
  list.forEach(i => {
    if (!is.undefined(i.onPreInit)) {
      i.onPreInit(app);
    }
  });
}
