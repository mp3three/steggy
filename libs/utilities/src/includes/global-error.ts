import { INestApplication } from '@nestjs/common';
import chalk from 'chalk';

import { AutoLogService } from '../services';
import { BootstrapOptions } from './bootstrap';

/* eslint-disable no-console */

let logger: AutoLogService;
let prettyLog: boolean;
const FIRST = 1;
const START = 0;
process.on('uncaughtException', function (error) {
  if (logger) {
    logger.error(`[${error.name}] ${error.message}`);
    if (prettyLog && error.stack) {
      const stack = error.stack.split(`\n`).slice(FIRST);
      console.log();
      console.log(chalk.bgRedBright.white` Fatal error `);
      const lines: [string, string[]][] = [];
      let maxMethod = 0;
      let maxPath = 0;
      let maxLine = 0;
      stack.forEach((line) => {
        line = line.trim();
        line = line.slice(line.indexOf(' ')).trim();
        const hasMethod = line.indexOf(' ') > line.indexOf('/');
        const method = !hasMethod ? '' : line.slice(START, line.indexOf(' '));
        if (hasMethod) {
          line = line.slice(hasMethod ? line.indexOf(' ') : START);
        }
        const parts = line.trim().replace('(', '').replace(')', '').split(':');
        parts.shift();

        maxMethod = Math.max(maxMethod, method.length);
        maxPath = Math.max(maxPath, parts[START].length);
        maxLine = Math.max(maxLine, parts[FIRST].length);
        lines.push([method, parts]);
      });
      console.log(
        chalk.red(
          lines
            .map(
              ([method, parts], index) =>
                chalk`  {cyan ${index})} {bold ${method.padEnd(
                  maxMethod,
                  ' ',
                )}} ${parts.shift().padEnd(maxPath, ' ')} {cyan.bold ${parts
                  .shift()
                  .padStart(maxLine, ' ')}}{white :}{cyan ${parts.shift()}}`,
            )
            .join(`\n`),
        ),
      );
    }
    process.exit();
  }
  console.error(error.name);
  console.error(error.message);
  console.error(error.stack);
  process.exit();
});
export async function GlobalErrorInit(
  app: INestApplication,
  server,
  options: BootstrapOptions,
): Promise<void> {
  logger = await app.resolve(AutoLogService);
  prettyLog = options.prettyLog;
}
