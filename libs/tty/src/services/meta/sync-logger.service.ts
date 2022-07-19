import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import {
  ACTIVE_APPLICATION,
  InjectConfig,
  LIB_BOILERPLATE,
  LOG_CONTEXT,
  LOG_LEVEL,
  LoggerFunction,
  LogLevels,
  methodColors,
  MISSING_CONTEXT,
  prettyFormatMessage,
} from '@steggy/boilerplate';
import { is, START } from '@steggy/utilities';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { ScreenService } from './screen.service';

const SORTED_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as LogLevels[];

@Injectable({ scope: Scope.TRANSIENT })
export class SyncLoggerService {
  constructor(
    @Inject(INQUIRER) private parent: unknown,
    @Inject(ACTIVE_APPLICATION) private readonly activeApplication: symbol,
    private readonly screen: ScreenService,
    @InjectConfig(LOG_LEVEL, LIB_BOILERPLATE)
    private readonly level: LogLevels,
  ) {}

  #cached: string;
  #context: string;
  private contextId: string;

  protected get context(): string {
    if (!this.#cached) {
      this.#cached ??= this.getContext();
      const [project, provider] = this.#cached.split(':');
      if (project === this.activeApplication.description) {
        this.#cached = provider;
      }
    }
    return this.#cached;
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
    this.log('debug', ...arguments_);
  }

  public error(message: string, ...arguments_: unknown[]): void;
  public error(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public error(...arguments_: Parameters<LoggerFunction>): void {
    this.log('error', ...arguments_);
  }

  public fatal(message: string, ...arguments_: unknown[]): void;
  public fatal(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public fatal(...arguments_: Parameters<LoggerFunction>): void {
    this.log('fatal', ...arguments_);
  }

  public info(message: string, ...arguments_: unknown[]): void;
  public info(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public info(...arguments_: Parameters<LoggerFunction>): void {
    this.log('info', ...arguments_);
  }

  /**
   * For edge case situations like:
   *
   *  - extreme early init
   *  - code locations where DI isn't available
   *
   * `@InjectLogger()` annotation is available for providers
   */
  public setContext(library: symbol, service: { name: string }): void {
    this.#context = `${library.description}:${service.name}`;
  }

  public trace(message: string, ...arguments_: unknown[]): void;
  public trace(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public trace(...arguments_: Parameters<LoggerFunction>): void {
    this.log('trace', ...arguments_);
  }

  public warn(message: string, ...arguments_: unknown[]): void;
  public warn(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  public warn(...arguments_: Parameters<LoggerFunction>): void {
    this.log('warn', ...arguments_);
  }

  private formatData({ time, ...data }: Record<string, unknown>): string {
    if (is.empty(Object.keys(data))) {
      if (time && !is.number(time)) {
        data.time = time;
      } else {
        return ``;
      }
    }
    return ``;
  }

  private getContext(): string {
    if (this.#context) {
      return this.#context;
    }
    // if (this.contextId) {
    //   return mappedContexts.get(this.contextId);
    // }
    return this.parent?.constructor[LOG_CONTEXT] ?? MISSING_CONTEXT;
  }

  private log(level: LogLevels, ...parameters: Parameters<LoggerFunction>) {
    if (SORTED_LEVELS.indexOf(level) < SORTED_LEVELS.indexOf(this.level)) {
      return;
    }
    const context = chalk`{bold.${methodColors
      .get(level)
      .slice('bg'.length)
      .toLowerCase()} [${this.context}]}`;
    const data = chalk.gray(
      is.object(parameters[START])
        ? JSON.stringify(parameters.shift() as Record<string, unknown>)
        : '',
    );
    const message = prettyFormatMessage(
      is.string(parameters[START]) ? (parameters.shift() as string) : ``,
    );
    const timestamp: number =
      is.object(parameters[START]) &&
      is.number((parameters[START] as Record<string, number>).time)
        ? (parameters[START] as Record<string, number>).time
        : undefined;
    this.screen.printLine(
      `[${dayjs(timestamp).format(
        'ddd HH:mm:ss.SSS',
      )}]: ${context} ${chalk.cyan(message)} ${data}`,
    );
  }
}
