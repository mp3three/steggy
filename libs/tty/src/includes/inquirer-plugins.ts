import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import datePrompt from 'inquirer-date-prompt';

import { SelectLinePrompt } from './select-line';
import { TimeoutPrompt } from './timeout';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('autocomplete', autocompletePrompt);
inquirer.registerPrompt('selectLine', SelectLinePrompt);
inquirer.registerPrompt('timeout', TimeoutPrompt);
