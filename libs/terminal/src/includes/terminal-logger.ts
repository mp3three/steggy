import { iLoggerCore } from '@automagical/utilities';
import { AutoLogService, prettyFormatMessage } from '@automagical/utilities';
import chalk from 'chalk';

/* eslint-disable security/detect-non-literal-regexp */

const NEST = '@nestjs';

/**
 * Draw attention to:
 *
 * - Broken module name
 * - Broken service name
 * - Working vs broken injection args
 */
const prettyErrorMessage = (message: string): string => {
  if (!message) {
    return ``;
  }
  const lines = message.split(`\n`);
  const prefix = "Nest can't resolve dependencies of the ";
  if (lines[0].includes(prefix)) {
    // eslint-disable-next-line prefer-const
    let [service, module] = lines[0].split('.');
    service = service.slice(prefix.length);
    const provider = service.slice(0, service.indexOf(' '));
    service = service.slice(service.indexOf(' ') + 1);
    const ctorArguments = service
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim());
    const match = module.match(new RegExp('in the ([^ ]+) context'));
    if (match) {
      message = message.replace(
        new RegExp(provider, 'g'),
        chalk.bold.yellow(provider),
      );
      ctorArguments.forEach((parameter) => {
        let out = parameter;
        out = parameter === '?' ? chalk.bold.red('?') : chalk.bold.green(out);
        message = message.replace(parameter, out);
      });
      message = message.replace(
        new RegExp(match[1], 'g'),
        chalk.bold(match[1]),
      );
    }
  }
  return message;
};

export const REPLAY_MESSAGES = new Set<[string, string]>();
let logger: iLoggerCore;
export function OnLoggerActivate(log: iLoggerCore): Set<[string, string]> {
  logger = log;
  return REPLAY_MESSAGES;
}
const noop = (): void => {
  //
};
export const PrettyNestLogger: Record<
  'log' | 'warn' | 'error' | 'debug' | 'verbose',
  (a: string, b: string) => void
> = {
  debug: noop,
  error: (message: string, context: string) => {
    context = `${NEST}:${context}`;
    if (context.length > 20) {
      // Context contains the stack trace of the nest injector
      // Nothing actually useful for debugging
      context = `@nestjs:ErrorMessage`;
      message = prettyErrorMessage(message);
    }
    logger.error({ context: `${NEST}:${context}` }, message);
  },
  log: (message: string, context: string) => {
    context = `${NEST}:${context}`;
    if (context === `${NEST}:InstanceLoader`) {
      message = prettyFormatMessage(
        message
          .split(' ')
          .map((item, index) => (index === 0 ? `[${item}]` : item))
          .join(' '),
      );
    }
    if (!logger) {
      REPLAY_MESSAGES.add([message, context]);
      return;
    }
    logger.info({ context }, message);
  },
  verbose: noop,
  warn: noop,
};

export function UseTerminalLogger(): void {
  AutoLogService.nestLogger = PrettyNestLogger;
}
