import {
  iLogger,
  iLoggerCore,
  LOG_CONTEXT,
  LogLevels,
  MISSING_CONTEXT,
} from '@automagical/contracts/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { ClassConstructor } from 'class-transformer';
import pino from 'pino';

import { mappedContexts } from '../../decorators/injectors';

/* eslint-disable security/detect-non-literal-regexp */

export type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

const NEST = '@nestjs';

/**
 * Use `@InjectLogger()` if context is not automatically found
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AutoLogService implements iLogger {
  // #region Static Properties

  public static logger: iLoggerCore = pino() as iLogger;
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
      // early shortcut for an over used call
      return;
    }
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

  // #endregion Public Static Methods

  // #region Object Properties

  private contextId: string;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(INQUIRER) private readonly inquirerer: ClassConstructor<unknown>,
  ) {}

  // #endregion Constructors

  // #region Public Accessors

  public get level(): LogLevels {
    return AutoLogService.logger.level as LogLevels;
  }

  // #endregion Public Accessors

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

  // #endregion Public Methods
}
