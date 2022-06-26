/**
 * ## Description
 *
 * These will be replaced when I figure out how to make the UI pull these directly form NPM instead
 *
 * ## Included
 *
 * - logger interface
 */
export const EXTRA_UI_TYPINGS = [
  `type LogLevels = 'info' | 'debug' | 'warn' | 'trace' | 'error' | 'fatal';`,
  `type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);`,
  `interface iLogger extends iLoggerCore {
  level: LogLevels | string;
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
}`,
  `interface iLoggerCore {
  level: LogLevels | string;
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
}`,
].join(`\n`);
