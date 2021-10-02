/* eslint-disable @typescript-eslint/no-magic-numbers */

import chalk from 'chalk';
import pino from 'pino';

import {
  AutoLogService,
  LoggerFunction,
} from '../services/logger/auto-log.service';
/* eslint-disable security/detect-non-literal-regexp */
const logger = pino({
  level: AutoLogService.logger.level,
  prettyPrint: {
    colorize: true,
    crlf: false,
    customPrettifiers: {},
    errorLikeObjectKeys: ['err', 'error'],
    errorProps: '',
    hideObject: false,
    ignore: 'pid,hostname',
    levelKey: ``,
    messageKey: 'msg',
    singleLine: true,
    timestampKey: 'time',
    translateTime: 'SYS:ddd hh:MM:ss.l',
  },
});
AutoLogService.logger = logger;
export type CONTEXT_COLORS =
  | 'bgBlue'
  | 'bgYellow'
  | 'bgGreen'
  | 'bgRed'
  | 'bgMagenta'
  | 'bgGrey';
export const highlightContext = (
  context: string,
  level: CONTEXT_COLORS,
): string => chalk`{bold.${level.slice(2).toLowerCase()} [${context}]}`;
const NEST = '@nestjs';
export const methodColors = new Map<pino.Level, CONTEXT_COLORS>([
  ['debug', 'bgBlue'],
  ['warn', 'bgYellow'],
  ['error', 'bgRed'],
  ['info', 'bgGreen'],
  ['fatal', 'bgMagenta'],
]);
export const prettyFormatMessage = (message: string): string => {
  if (!message) {
    return ``;
  }
  let matches = message.match(new RegExp('([^ ]+#[^ ]+)'));
  if (matches) {
    message = message.replace(matches[0], chalk.bold(matches[0]));
  }
  matches = message.match(new RegExp('(\\[[^\\]]+\\])'));
  if (matches) {
    message = message.replace(
      matches[0],
      chalk.bold.magenta(matches[0].slice(1, -1)),
    );
  }
  matches = message.match(new RegExp('(\\{[^\\]]+\\})'));
  if (matches) {
    message = message.replace(
      matches[0],
      chalk`{bold.gray ${matches[0].slice(1, -1)}}`,
    );
  }
  return message;
};

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
  const prefix = 'dependencies of the ';
  if (lines[0].includes(prefix)) {
    // eslint-disable-next-line prefer-const
    let [service, module] = lines[0].split('.');
    service = service.slice(service.indexOf(prefix) + prefix.length);
    const provider = service.slice(0, service.indexOf(' '));
    service = service.slice(service.indexOf(' ') + 1);
    const ctorArguments = service
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim());
    let match = module.match(new RegExp('in the ([^ ]+) context'));
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
    match = module.match(new RegExp('the argument ([^ ]+) at'));
    if (match) {
      message = message.replace(
        new RegExp(match[1], 'g'),
        chalk.bold.magenta(match[1]),
      );
    }
  }

  return message;
};

export const PrettyNestLogger: Record<
  'log' | 'warn' | 'error' | 'debug' | 'verbose',
  (a: string, b: string) => void
> = {
  debug: (message, context: string) => {
    context = `${NEST}:${context}`;
    if (context === `${NEST}:InstanceLoader`) {
      message = prettyFormatMessage(
        message
          .split(' ')
          .map((item, index) => (index === 0 ? `[${item}]` : item))
          .join(' '),
      );
    }
    // Never actually seen this come through
    // Using magenta to make it obvious if it happens, but will change to blue later
    logger.debug(`${highlightContext(context, 'bgMagenta')} ${message}`);
  },
  error: (message: string, context: string) => {
    context = `${NEST}:${context}`;
    if (context.length > 20) {
      // Context contains the stack trace of the nest injector
      // Nothing actually useful for debugging
      message = prettyErrorMessage(context);
      context = `@nestjs:ErrorMessage`;
    }
    logger.error(
      `${highlightContext(context, 'bgRed')} ${
        message ?? 'ERROR MESSAGE NOT PROVIDED'
      }`,
    );
  },
  log: (message, context) => {
    context = `${NEST}:${context}`;
    if (context === `${NEST}:InstanceLoader`) {
      message = prettyFormatMessage(
        message
          .split(' ')
          .map((item, index) => (index === 0 ? `[${item}]` : item))
          .join(' '),
      );
    }
    if (context === `${NEST}:RoutesResolver`) {
      const parts = message.split(' ');
      message = prettyFormatMessage(
        [`[${parts[0]}]`, parts[1]].join(' ').slice(0, -1),
      );
    }
    if (context === `${NEST}:NestApplication` && message.includes('started')) {
      // Don't judge me for rewriting messages to add emoji
      message = `🐣 ${message} 🐣`;
    }
    if (context === `${NEST}:RouterExplorer`) {
      const [parts] = message.match(new RegExp('(\\{[^\\]]+\\})'));
      const [path, method] = parts.slice(1, -1).split(', ');
      message = prettyFormatMessage(` - [${method}] {${path}}`);
      // if (matches) {
      //   message = message.replace(
      //     matches[0],
      //     chalk`{bold.gray ${matches[0].slice(1, -1)}}`,
      //   );
      // }
      // const parts = message.split(' ');
      // message = prettyFormatMessage(
      //   [`[${parts[0]}]`, parts[1]].join(' ').slice(0, -1),
      // );
    }
    logger.info(`${highlightContext(context, 'bgGreen')} ${message}`);
  },

  verbose: (message, context) => {
    PrettyNestLogger.debug(message, context);
  },
  warn: (message, context) => {
    logger.warn(
      `${highlightContext(`${NEST}:${context}`, 'bgYellow')} ${message}`,
    );
  },
};

export function UsePrettyLogger(): void {
  AutoLogService.prettyLogger = true;
  AutoLogService.nestLogger = PrettyNestLogger;
  AutoLogService.logger = logger;
  AutoLogService.call = function (
    method: pino.Level,
    context: string,
    ...parameters: Parameters<LoggerFunction>
  ): void {
    if (method === 'trace' && AutoLogService.logger.level !== 'trace') {
      // early shortcut for an over used call
      return;
    }
    const logger = AutoLogService.getLogger() as pino.Logger;
    if (typeof parameters[0] === 'object') {
      logger[method](
        parameters.shift() as Record<string, unknown>,
        `${highlightContext(
          context,
          methodColors.get(method),
        )} ${prettyFormatMessage(parameters.shift() as string)}`,
        ...parameters,
      );
      return;
    }
    logger[method](
      `${highlightContext(
        context,
        methodColors.get(method),
      )} ${prettyFormatMessage(parameters.shift() as string)}`,
      ...parameters,
    );
  };
}
