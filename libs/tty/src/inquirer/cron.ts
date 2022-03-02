import {
  ARRAY_OFFSET,
  INCREMENT,
  INVERT_VALUE,
  is,
  START,
} from '@automagical/utilities';
import chalk from 'chalk';

import { InquirerPrompt } from '../decorators';

const HELP = [
  chalk.bold.white`Comma separate multiple values`,
  chalk`   {cyan Ex:} 1,2,3,4 * * * *`,
  ` `,
  chalk.bold.white`Value ranges`,
  chalk`   {cyan Ex:} 1-5 * * * *`,
  ` `,
  chalk.bold.white`Step values`,
  chalk`   {cyan Ex:} 1-10/2 = 2,4,6,8,10`,
  chalk`   {cyan Ex:} */2 = every other`,
  ` `,
  ` `,
];
const secondLine = 9;
const minuteLine = 8;
const hourLine = 7;
const dayLine = 6;
const monthLine = 5;
const dowLine = 4;

enum CronFields {
  second = 'second',
  minute = 'minute',
  hour = 'hour',
  day = 'day',
  month = 'month',
  dow = 'dow',
}
const ORDER = [
  'second',
  'minute',
  'hour',
  'day',
  'month',
  'dow',
] as CronFields[];

const ACTIVE = 'cyan.bold';
const INACTIVE = 'gray';

export class CronPromptOptions {
  public value?: string;
}

export class CronPrompt extends InquirerPrompt<CronPromptOptions> {
  private field = CronFields.second;
  private values: Map<CronFields, string>;

  protected onBackspace(): void {
    const current = this.values.get(this.field);
    this.values.set(this.field, current.slice(START, INVERT_VALUE));
  }

  protected onDelete(): void {
    this.values.set(this.field, '');
  }

  protected onEnd(): void {
    super.onEnd();
    this.done(
      [...this.values.values()]
        .map((item) => (is.empty(item) ? '*' : item))
        .join(' '),
    );
  }

  protected onInit(): void {
    this.opt.value ??= '';
    const [second, minute, hour, day, month, dow] = this.opt.value.split(' ');
    this.values = new Map([
      [CronFields.second, second || ''],
      [CronFields.minute, minute || ''],
      [CronFields.hour, hour || ''],
      [CronFields.day, day || ''],
      [CronFields.month, month || ''],
      [CronFields.dow, dow || ''],
    ]);
    this.setKeyMap(
      new Map([
        [{ key: 'enter' }, 'onEnd'],
        [{ key: 'backspace' }, 'onBackspace'],
        [{ key: ['space', 'right'] }, 'onRight'],
        [{ key: 'left' }, 'onLeft'],
        [{ key: 'delete' }, 'onDelete'],
        [{ key: [...'0123456789/-,*'] }, 'onKeypress'],
      ]),
    );
  }

  protected onKeypress(key: string): void {
    this.values.set(this.field, this.values.get(this.field) + key);
  }

  protected onLeft(): void {
    if (this.field === ORDER[START]) {
      return;
    }
    this.field = ORDER[ORDER.indexOf(this.field) - INCREMENT];
  }

  protected onRight(): void {
    if (this.field === ORDER[ORDER.length - ARRAY_OFFSET]) {
      return;
    }
    this.field = ORDER[ORDER.indexOf(this.field) + INCREMENT];
  }

  protected render(): void {
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }
    const message = [
      ...HELP,
      ...this.renderHeader(),
      [...this.values.entries()]
        .map(([type, value]) => {
          value = is.empty(value) ? chalk.gray('*') : value;
          return type === this.field ? chalk.cyan.inverse(value) : value;
        })
        .join(' '),
    ].join(`\n`);
    this.screen.render(message, '');
  }

  private renderHeader(): string[] {
    const [
      secondColor,
      minuteColor,
      hourColor,
      dayColor,
      monthColor,
      dowColor,
    ] = [
      this.field === CronFields.second ? ACTIVE : INACTIVE,
      this.field === CronFields.minute ? ACTIVE : INACTIVE,
      this.field === CronFields.hour ? ACTIVE : INACTIVE,
      this.field === CronFields.day ? ACTIVE : INACTIVE,
      this.field === CronFields.month ? ACTIVE : INACTIVE,
      this.field === CronFields.dow ? ACTIVE : INACTIVE,
    ];
    const [second, minute, hour, day, month] = [
      this.values.get(CronFields.second) || '*',
      this.values.get(CronFields.minute) || '*',
      this.values.get(CronFields.hour) || '*',
      this.values.get(CronFields.day) || '*',
      this.values.get(CronFields.month) || '*',
    ];
    return [
      chalk`{${secondColor} ┌${'─'.repeat(
        secondLine + (second + minute + hour + day + month).length,
      )}} {${secondColor} second}            {gray 0-59}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} ┌${'─'.repeat(
        minuteLine + (minute + hour + day + month).length,
      )}} {${minuteColor} minute}            {gray 0-59}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} │}${' '.repeat(
        minute.length,
      )}{${hourColor} ┌${'─'.repeat(
        hourLine + (hour + day + month).length,
      )}} {${hourColor} hour}              {gray 0-23}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} │}${' '.repeat(
        minute.length,
      )}{${hourColor} │}${' '.repeat(hour.length)}{${dayColor} ┌${'─'.repeat(
        dayLine + (day + month).length,
      )}} {${dayColor} day of month}      {gray 1-31}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} │}${' '.repeat(
        minute.length,
      )}{${hourColor} │}${' '.repeat(hour.length)}{${dayColor} │}${' '.repeat(
        day.length,
      )}{${monthColor} ┌${'─'.repeat(
        monthLine + month.length,
      )}} {${monthColor} month}             {gray 1-12 or names}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} │}${' '.repeat(
        minute.length,
      )}{${hourColor} │}${' '.repeat(hour.length)}{${dayColor} │}${' '.repeat(
        day.length,
      )}{${monthColor} │}${' '.repeat(month.length)}{${dowColor} ┌${'─'.repeat(
        dowLine,
      )}} {${dowColor} day of week}       {gray 0-7 or names}{cyan ,} {gray 0 & 7 = Sun}`,
      chalk`{${secondColor} │}${' '.repeat(
        second.length,
      )}{${minuteColor} │}${' '.repeat(
        minute.length,
      )}{${hourColor} │}${' '.repeat(hour.length)}{${dayColor} │}${' '.repeat(
        day.length,
      )}{${monthColor} │}${' '.repeat(month.length)}{${dowColor} │}`,
    ];
  }
}
