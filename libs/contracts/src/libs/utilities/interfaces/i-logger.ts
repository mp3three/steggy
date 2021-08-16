export type LogLevels =
  | 'info'
  | 'debug'
  | 'warn'
  | 'trace'
  | 'error'
  | 'fatal'
  | 'silent';
type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);

export interface iLogger extends iLoggerCore {
  // #region Object Properties

  level: LogLevels | string;

  // #endregion Object Properties

  // #region Public Methods

  debug(message: string, ...arguments_: unknown[]): void;
  debug(...arguments_: Parameters<LoggerFunction>): void;
  error(message: string, ...arguments_: unknown[]): void;
  error(...arguments_: Parameters<LoggerFunction>): void;
  fatal(message: string, ...arguments_: unknown[]): void;
  fatal(...arguments_: Parameters<LoggerFunction>): void;
  info(message: string, ...arguments_: unknown[]): void;
  info(...arguments_: Parameters<LoggerFunction>): void;
  trace(message: string, ...arguments_: unknown[]): void;
  trace(...arguments_: Parameters<LoggerFunction>): void;
  warn(message: string, ...arguments_: unknown[]): void;
  warn(...arguments_: Parameters<LoggerFunction>): void;

  // #endregion Public Methods
}

export interface iLoggerCore {
  // #region Object Properties

  level: LogLevels | string;

  // #endregion Object Properties

  // #region Public Methods

  debug(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  error(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  fatal(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  info(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  trace(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  warn(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;

  // #endregion Public Methods
}
