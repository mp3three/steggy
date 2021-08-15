import { UsePrettyLogger } from '@automagical/utilities';
import chalk from 'chalk';

export async function Activate(): Promise<void> {
  //
}

if (chalk.supportsColor) {
  UsePrettyLogger();
}
