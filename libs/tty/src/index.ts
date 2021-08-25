export * from './decorators';
export * from './modules';
export * from './repl';
export * from './services';

import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

// This seems to be the correct way to load the plugin
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
inquirer.registerPrompt('date', datePrompt);
