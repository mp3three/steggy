import { Injectable, Scope } from '@nestjs/common';
import pino from 'pino';
type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

let logger = pino();
import chalk from 'chalk';
const NEST = '@nestjs';
let prettyPrint = false;

@Injectable({ scope: Scope.TRANSIENT })
export class AutoLogService {
  // #region Static Properties

  public static logger = logger;

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
    if (method === 'trace' && logger.level !== 'trace') {
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
    'log' | 'warn' | 'error',
    (a: string, b: string) => void
  > {
    return {
      error: (message, context) => {
        if (!prettyPrint) {
          logger.error({ context }, message);
          return;
        }
        logger.error(chalk`{bold ${NEST}:${context}} ${message}`);
      },
      log: (message, context) => {
        if (!prettyPrint) {
          logger.info({ context }, message);
          return;
        }
        logger.info(chalk`{bold ${NEST}:${context}} ${message}`);
      },
      warn: (message, context) => {
        if (!prettyPrint) {
          logger.warn({ context }, message);
          return;
        }
        logger.warn(chalk`{bold ${NEST}:${context}} ${message}`);
      },
    };
  }

  public static prettyLog(): void {
    const level = logger.level;
    prettyPrint = true;
    logger = pino({
      level,
      prettyPrint: {
        colorize: true,
        crlf: false,
        customPrettifiers: {},
        errorLikeObjectKeys: ['err', 'error'],
        errorProps: '',
        hideObject: false,
        ignore: 'pid,hostname',
        levelFirst: false,
        levelKey: 'level',
        messageKey: 'msg',
        singleLine: false,
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
    logger[method](
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
      logger[method](
        parameters.shift() as Record<string, unknown>,
        chalk`{bold ${context}} ${parameters.shift()}`,
        ...parameters,
      );
      return;
    }
    logger[method](
      chalk`{bold ${context}} ${parameters.shift()}`,
      ...parameters,
    );
  }

  // #endregion Private Static Methods

  // #region Object Properties

  private context = '';

  // #endregion Object Properties

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
