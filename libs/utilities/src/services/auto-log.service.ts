import { Injectable, Scope } from '@nestjs/common';
import pino from 'pino';
type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

const logger = pino();

@Injectable({ scope: Scope.TRANSIENT })
export class AutoLogService {
  // #region Static Properties

  public static logger = logger;

  // #endregion Static Properties

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
    this.call('debug', ...arguments_);
  }

  public error(message: string, ...arguments_: unknown[]): void;
  public error(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public error(...arguments_: Parameters<LoggerFunction>): void {
    this.call('error', ...arguments_);
  }

  public fatal(message: string, ...arguments_: unknown[]): void;
  public fatal(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public fatal(...arguments_: Parameters<LoggerFunction>): void {
    this.call('fatal', ...arguments_);
  }

  public info(message: string, ...arguments_: unknown[]): void;
  public info(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public info(...arguments_: Parameters<LoggerFunction>): void {
    this.call('info', ...arguments_);
  }

  public trace(message: string, ...arguments_: unknown[]): void;
  public trace(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public trace(...arguments_: Parameters<LoggerFunction>): void {
    this.call('trace', ...arguments_);
  }

  public warn(message: string, ...arguments_: unknown[]): void;
  public warn(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public warn(...arguments_: Parameters<LoggerFunction>): void {
    this.call('warn', ...arguments_);
  }

  // #endregion Public Methods

  // #region Private Methods

  private call(method: pino.Level, ...parameters: Parameters<LoggerFunction>) {
    const data =
      typeof parameters[0] === 'object'
        ? (parameters.shift() as Record<string, unknown>)
        : {};
    const message =
      typeof parameters[0] === 'string' ? (parameters.shift() as string) : ``;
    logger[method](this.mergeContext(data), message, ...parameters);
  }

  private mergeContext(
    context: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      context: this.context,
      ...context,
    };
  }

  // #endregion Private Methods
}
