export * from './config';
export * from './contracts';
export * from './decorators';
export * from './modules';
export * from './repl';
export * from './services';

import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

// @ts-expect-error This seems to be the correct way to load the plugin
inquirer.registerPrompt('date', datePrompt);
