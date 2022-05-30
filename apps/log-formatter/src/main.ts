/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  iQuickScript,
  methodColors,
  prettyFormatMessage,
  QuickScript,
} from '@steggy/boilerplate';
import { SyncLoggerService, TTYModule } from '@steggy/tty';
import { is } from '@steggy/utilities';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { Level } from 'pino';
import { stdin, stdout } from 'process';
import { createInterface } from 'readline';

const LEVELS = new Map<number, Level>([
  [10, 'trace'],
  [20, 'debug'],
  [30, 'info'],
  [40, 'warn'],
  [50, 'error'],
  [60, 'fatal'],
]);

const rl = createInterface({
  input: stdin,
  output: stdout,
  terminal: false,
});
const BOOT_MESSAGES: string[] = [];
const BOOT_CAPTURE = rl.on('line', line => BOOT_MESSAGES.push(line));

@QuickScript({
  application: Symbol('log-formatter'),
  // Show all log messages
  bootstrap: { config: { libs: { boilerplate: { LOG_LEVEL: 'trace' } } } },
  // Need TTYModule for sync logger
  imports: [TTYModule],
})
export class ConfigScanner implements iQuickScript {
  constructor(private readonly syncLogger: SyncLoggerService) {}

  public exec() {
    BOOT_CAPTURE.close();
    BOOT_MESSAGES.forEach(line => this.printLine(line));
    rl.on('line', line => this.printLine(line));
  }

  private printLine(line: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { level, pid, hostname, time, context, msg, ...data } =
      JSON.parse(line);

    const formattedContext = chalk`{bold.${methodColors
      .get(LEVELS.get(level))
      .slice('bg'.length)
      .toLowerCase()} [${context}]}`;
    const formattedData = chalk.gray(
      !is.empty(Object.keys(data)) ? JSON.stringify(data) : '',
    );
    const message = prettyFormatMessage(msg);

    console.log(
      `[${dayjs(time).format(
        'ddd HH:mm:ss.SSS',
      )}]: ${formattedContext} ${chalk.cyan(message)} ${formattedData}`,
    );
  }
}
