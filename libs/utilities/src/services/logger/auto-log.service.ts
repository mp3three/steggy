import { LOG_CONTEXT, MISSING_CONTEXT } from '@automagical/contracts/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import pino from 'pino';

import { mappedContexts } from '../../decorators/injectors';
/* eslint-disable security/detect-non-literal-regexp */

type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

const NEST = '@nestjs';
let prettyPrint = false;

const highlightContext = (
  context: string,
  level: 'bgBlue' | 'bgYellow' | 'bgGreen' | 'bgRed' | 'bgMagenta',
): string => chalk`{bold.${level.slice(2).toLowerCase()} [${context}]}`;

const methodColors = new Map<
  pino.Level,
  'bgBlue' | 'bgYellow' | 'bgGreen' | 'bgRed' | 'bgMagenta'
>([
  ['debug', 'bgBlue'],
  ['warn', 'bgYellow'],
  ['error', 'bgRed'],
  ['info', 'bgGreen'],
  ['fatal', 'bgMagenta'],
]);

const prettyFormatMessage = (message: string): string => {
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
      chalk`{underline.bold ${matches[0]}}`,
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
  // Nest can't resolve dependencies of the RecentUpdatesService (BLESSED_SCREEN, ?, HASocketAPIService). Please make sure that the argument dependency at index [1] is available in the DashboardModule context.

  // Potential solutions:
  // - If dependency is a provider, is it part of the current DashboardModule?
  // - If dependency is exported from a separate @Module, is that module imported within DashboardModule?
  //   @Module({
  //     imports: [ /* the Module containing dependency */ ]
  //   })
  return message;
};

@Injectable({ scope: Scope.TRANSIENT })
export class AutoLogService {
  // #region Static Properties

  public static logger = pino();

  // #endregion Static Properties

  // #region Public Static Methods

  /**
   * Decide which method of formatting log messages is correct
   *
   * - Normal: intended for production use cases
   * - Pretty: development use cases
   */
  public static call(
    method: pino.Level,
    context: string,
    ...parameters: Parameters<LoggerFunction>
  ): void {
    if (method === 'trace' && AutoLogService.logger.level !== 'trace') {
      // early shortcut
      return;
    }
    if (prettyPrint) {
      this.callPretty(method, context, parameters);
      return;
    }
    this.callNormal(method, context, parameters);
  }

  public static nestLogger(): Record<
    'log' | 'warn' | 'error' | 'debug' | 'verbose',
    (a: string, b: string) => void
  > {
    const out = {
      debug: (message, context) => {
        context = `${NEST}:${context}`;
        if (!prettyPrint) {
          AutoLogService.logger.info({ context }, message);
          return;
        }
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
        AutoLogService.logger.debug(
          `${highlightContext(context, 'bgMagenta')} ${message}`,
        );
      },
      error: (message: string, context: string) => {
        context = `${NEST}:${context}`;
        if (!prettyPrint) {
          AutoLogService.logger.error({ context }, message);
          return;
        }
        if (context.length > 20) {
          // Context contains the stack trace of the nest injector
          // Nothing actually useful for debugging
          context = `@nestjs:ErrorMessage`;
          message = prettyErrorMessage(message);
        }
        AutoLogService.logger.error(
          `${highlightContext(context, 'bgRed')} ${message}`,
        );
      },
      log: (message, context) => {
        context = `${NEST}:${context}`;
        if (!prettyPrint) {
          AutoLogService.logger.info({ context }, message);
          return;
        }
        if (context === `${NEST}:InstanceLoader`) {
          message = prettyFormatMessage(
            message
              .split(' ')
              .map((item, index) => (index === 0 ? `[${item}]` : item))
              .join(' '),
          );
        }
        AutoLogService.logger.info(
          `${highlightContext(context, 'bgGreen')} ${message}`,
        );
      },

      verbose: (message, context) => {
        out.debug(message, context);
      },
      warn: (message, context) => {
        context = `${NEST}:${context}`;
        if (!prettyPrint) {
          AutoLogService.logger.warn({ context }, message);
          return;
        }
        AutoLogService.logger.warn(
          `${highlightContext(context, 'bgYellow')} ${message}`,
        );
      },
    };
    return out;
  }

  public static prettyLog(): void {
    const level = AutoLogService.logger.level;
    prettyPrint = true;
    AutoLogService.logger = pino({
      level,
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
  }

  // #endregion Public Static Methods

  // #region Private Static Methods

  private static callNormal(
    method: pino.Level,
    context: string,
    parameters: Parameters<LoggerFunction>,
  ): void {
    const data =
      typeof parameters[0] === 'object'
        ? (parameters.shift() as Record<string, unknown>)
        : {};
    const message =
      typeof parameters[0] === 'string' ? (parameters.shift() as string) : ``;
    AutoLogService.logger[method](
      {
        context,
        ...data,
      },
      message,
      ...parameters,
    );
  }

  private static callPretty(
    method: pino.Level,
    context: string,
    parameters: Parameters<LoggerFunction>,
  ): void {
    if (typeof parameters[0] === 'object') {
      AutoLogService.logger[method](
        parameters.shift() as Record<string, unknown>,
        `${highlightContext(
          context,
          methodColors.get(method),
        )} ${prettyFormatMessage(parameters.shift() as string)}`,
        ...parameters,
      );
      return;
    }
    AutoLogService.logger[method](
      `${highlightContext(
        context,
        methodColors.get(method),
      )} ${prettyFormatMessage(parameters.shift() as string)}`,
      ...parameters,
    );
  }

  // #endregion Private Static Methods

  // #region Object Properties

  private contextId: string;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(INQUIRER) private readonly inquirerer: ClassConstructor<unknown>,
  ) {}

  // #endregion Constructors

  // #region Private Accessors

  private get context(): string {
    if (this.contextId) {
      return mappedContexts.get(this.contextId);
    }
    return this.inquirerer?.constructor[LOG_CONTEXT] ?? MISSING_CONTEXT;
  }

  // #endregion Private Accessors

  // #region Public Methods

  public debug(message: string, ...arguments_: unknown[]): void;
  public debug(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public debug(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('debug', this.context, ...arguments_);
  }

  public error(message: string, ...arguments_: unknown[]): void;
  public error(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public error(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('error', this.context, ...arguments_);
  }

  public fatal(message: string, ...arguments_: unknown[]): void;
  public fatal(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public fatal(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('fatal', this.context, ...arguments_);
  }

  public info(message: string, ...arguments_: unknown[]): void;
  public info(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public info(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('info', this.context, ...arguments_);
  }

  public warn(message: string, ...arguments_: unknown[]): void;
  public warn(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public warn(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('warn', this.context, ...arguments_);
  }

  // #endregion Public Methods
}

if (chalk.supportsColor) {
  AutoLogService.prettyLog();
}
