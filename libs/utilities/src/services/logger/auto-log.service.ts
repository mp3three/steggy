import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import pino from 'pino';
import pinoHttp from 'pino-http';

import { iLogger, iLoggerCore, LogLevels } from '../../contracts/interfaces';
import { LOG_CONTEXT, MISSING_CONTEXT } from '../../contracts/logger/constants';
import { mappedContexts } from '../../decorators/injectors';
import { storage } from '../../includes';

/* eslint-disable security/detect-non-literal-regexp */
export type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

const NEST = '@nestjs';
export const NEST_NOOP_LOGGER = {
  error: (): void => {
    //
  },
  log: (): void => {
    //
  },
  warn: (): void => {
    //
  },
};

const logger = pino() as iLogger;
const http = pinoHttp({
  autoLogging: true,
  useLevel: 'info',
});

/**
 * Use `@InjectLogger()` if context is not automatically found
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AutoLogService implements iLogger {
  public static logger: iLoggerCore = http.logger;
  public static nestLogger: Record<
    'log' | 'warn' | 'error' | 'debug' | 'verbose',
    (a: string, b: string) => void
  > = {
    debug: (message, context: string) =>
      AutoLogService.logger.debug({ context: `${NEST}:${context}` }, message),
    error: (message: string, context: string) =>
      AutoLogService.logger.error({ context: `${NEST}:${context}` }, message),
    log: (message, context) =>
      AutoLogService.logger.info({ context: `${NEST}:${context}` }, message),
    verbose: (message, context) =>
      AutoLogService.logger.debug({ context: `${NEST}:${context}` }, message),
    warn: (message, context) =>
      AutoLogService.logger.warn({ context: `${NEST}:${context}` }, message),
  };

  public static getLogger(): iLoggerCore {
    const store = storage.getStore();
    return store || AutoLogService.logger;
  }

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
      // early shortcut for an over used call
      return;
    }
    const logger = this.getLogger();
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

  private contextId: string;
  #context: string;

  constructor(@Inject(INQUIRER) private inquirerer: unknown) {}

  public get level(): LogLevels {
    return AutoLogService.logger.level as LogLevels;
  }

  protected get context(): string {
    if (this.#context) {
      return this.#context;
    }
    if (this.contextId) {
      return mappedContexts.get(this.contextId);
    }
    return this.inquirerer?.constructor[LOG_CONTEXT] ?? MISSING_CONTEXT;
  }

  /**
   * Available for if automated context setting doesn't work / isn't avaiable.
   * Those are the vast minority of use cases in the repo, so this definition is currently hidden (protected).
   * Set like this if actually needed
   *
   * ```typescript
   * logger['context'] = `${LIB_ALIENS.description}:SomethingIdentifying`;
   * ```
   */
  protected set context(value: string) {
    this.#context = value;
  }

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

  public trace(message: string, ...arguments_: unknown[]): void;
  public trace(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public trace(...arguments_: Parameters<LoggerFunction>): void {
    AutoLogService.call('trace', this.context, ...arguments_);
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
}
