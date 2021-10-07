import {
  BLESSED_GRID,
  GridElement,
  Log,
  LogElement,
  LogOptions,
} from '@automagical/terminal';
import { LIB_UTILS } from '@automagical/utilities';
import {
  iLoggerCore,
  LogLevels,
  MISSING_CONTEXT,
} from '@automagical/utilities';
import {
  AutoConfigService,
  AutoLogService,
  CONTEXT_COLORS,
  Debug,
  highlightContext,
  LOG_LEVEL,
  prettyFormatMessage,
} from '@automagical/utilities';
import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

import { Workspace, WorkspaceElement } from '../decorators';
import { FontAwesomeIcons } from '../../../tty/src/icons';
import { OnLoggerActivate } from '../includes';

type LOG_DATA = Record<string, unknown> & { context?: string };

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
  customHeader: true,
  friendlyName: 'Logger',
  menu: [chalk` ${FontAwesomeIcons.server}  {bold Logger}`],
  name: 'logger',
})
export class LoggerWorkspace implements iLoggerCore {
  public level: LogLevels;

  @WorkspaceElement()
  private WIDGET: LogElement;

  constructor(
    @Inject(BLESSED_GRID)
    private readonly GRID: GridElement,
    private readonly configService: AutoConfigService,
    private readonly logger: AutoLogService,
  ) {}

  public debug(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('debug')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgBlue');
  }

  public error(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('error')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgRed');
  }

  public fatal(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('fatal')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgMagenta');
  }

  public info(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('info')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgGreen');
  }

  public trace(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('trace')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgGrey');
  }

  public warn(data: LOG_DATA, message: string): void {
    if (LEVELS.get(this.level) > LEVELS.get('warn')) {
      return;
    }
    data ??= {};
    this.logMessage(data, message, 'bgYellow');
  }

  @Debug({ after: 'Logger workspace attached' })
  protected onModuleInit(): void {
    this.level = this.configService.get([LIB_UTILS, LOG_LEVEL]);
    this.WIDGET = this.GRID.set(0, 2, 12, 10, Log, {
      fg: 'cyan',
      hidden: true,
    } as LogOptions);
    this.WIDGET.border = {};
    AutoLogService.logger = this;
    const REPLAY_MESSAGES = OnLoggerActivate(this);
    REPLAY_MESSAGES.forEach(([message, context]) => {
      this.logger.info({ context }, message);
    });
  }

  private logMessage(
    { context, ...data }: LOG_DATA,
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
}
