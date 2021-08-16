import { LOG_LEVEL } from '@automagical/contracts/config';
import {
  BLESSED_GRID,
  GridElement,
  Log,
  LogElement,
  LogOptions,
} from '@automagical/contracts/terminal';
import {
  iLoggerCore,
  LogLevels,
  MISSING_CONTEXT,
} from '@automagical/contracts/utilities';
import { FontAwesomeIcons, Workspace } from '@automagical/terminal';
import {
  AutoConfigService,
  AutoLogService,
  CONTEXT_COLORS,
  highlightContext,
  prettyFormatMessage,
} from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { WorkspaceElement } from '../decorators';

type LogData = Record<string, unknown> & { context?: string };

const LEVELS = new Map<LogLevels, number>([
  ['trace', 1],
  ['debug', 2],
  ['info', 3],
  ['warn', 4],
  ['error', 5],
  ['fatal', 6],
  ['silent', 7],
]);

@Workspace({
  defaultWorkspace: true,
  friendlyName: 'Logger',
  menu: [chalk` ${FontAwesomeIcons.server}  {bold Logger}`],
  name: 'logger',
})
export class LoggerWorkspace implements iLoggerCore {
  // #region Object Properties

  public level: LogLevels;

  @WorkspaceElement()
  private WIDGET: LogElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
    private readonly configService: AutoConfigService,
    private readonly logger: AutoLogService,
  ) {
    AutoLogService.logger = this;
  }

  // #endregion Constructors

  // #region Public Methods

  public debug(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('debug')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgBlue');
  }

  public error(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('error')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgRed');
  }

  public fatal(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('fatal')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgMagenta');
  }

  public info(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('info')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgGreen');
  }

  public trace(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('trace')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgGrey');
  }

  public warn(data: LogData, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('warn')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgYellow');
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onApplicationBootstrap(): Promise<void> {
    this.WIDGET = this.GRID.set(3, 2, 9, 8, Log, {
      draggable: true,
      fg: 'cyan',
      hidden: true,
      label: 'Logger',
    } as LogOptions);
    this.level = this.configService.get(LOG_LEVEL);
  }

  // #endregion Protected Methods

  // #region Private Methods

  private logMessage(
    { context, ...data }: LogData,
    message: string,
    color: CONTEXT_COLORS,
  ): void {
    const messageParts = [
      chalk.white(`[${dayjs().format(`ddd hh:mm:ss.SSS`)}]:`),
      highlightContext(context ?? MISSING_CONTEXT, color),
      prettyFormatMessage(message),
    ];
    const dataKeys = Object.keys(data);
    if (dataKeys.length > 0) {
      messageParts.push(`\n${chalk.white.bold(this.padObject(data))}`);
    }
    this.WIDGET?.log(messageParts.join(' '));
  }

  private padObject(data: Record<string, unknown>): string {
    const lines = JSON.stringify(data, undefined, 2).split(`\n`);
    let max = 0;
    lines.forEach((line) => (max = max > line.length ? max : line.length));
    return lines
      .map((line) => line.padEnd(max + 1, ' ').padStart(max + 2, ' '))
      .join(`\n`);
  }

  // #endregion Private Methods
}
