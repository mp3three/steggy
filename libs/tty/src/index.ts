export * from './config';
export * from './contracts';
export * from './decorators';
export * from './icons';
export * from './modules';
export * from './repl';
export * from './services';

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import datePrompt from 'inquirer-date-prompt';

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
inquirer.registerPrompt('autocomplete', autocompletePrompt);
