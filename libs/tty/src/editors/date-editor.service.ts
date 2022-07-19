/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  ARRAY_OFFSET,
  INCREMENT,
  INVERT_VALUE,
  is,
  SINGLE,
  START,
  VALUE,
} from '@steggy/utilities';
import chalk from 'chalk';
import { parse, parseDate } from 'chrono-node';
import dayjs from 'dayjs';

import { KeyModifiers, tKeyMap, TTYKeypressOptions } from '../contracts';
import { Editor, iBuilderEditor } from '../decorators';
import { ansiPadEnd, ansiStrip } from '../includes';
import {
  KeyboardManagerService,
  KeymapService,
  ScreenService,
  TextRenderingService,
} from '../services';

export enum TTYDateTypes {
  datetime = 'datetime',
  date = 'date',
  time = 'time',
  range = 'range',
}
type tDateType = `${TTYDateTypes}`;
export enum TTYFuzzyTypes {
  always = 'always',
  never = 'never',
  user = 'user',
}
export interface DateEditorEditorOptions {
  current?: string;
  /**
   * Interpret values with chrono-node
   */
  fuzzy?: `${TTYFuzzyTypes}`;
  label?: string;
  type?: tDateType;
}

const MONTH_MAX = new Map([
  [1, 31],
  // TODO: Caring about leap years
  [2, 29],
  [3, 31],
  [4, 30],
  [5, 31],
  [6, 30],
  [7, 31],
  [8, 31],
  [9, 30],
  [10, 31],
  [11, 30],
  [12, 31],
]);
const DEFAULT_PLACEHOLDER = 'tomorrow at noon';
const DEFAULT_RANGE_PLACEHOLDER = 'tomorrow at noon to next friday';
const ELLIPSES = '...';
const INTERNAL_PADDING = ' ';
const PADDING = 46; // 50-4

type DATE_TYPES = 'day' | 'hour' | 'minute' | 'month' | 'second' | 'year';
const SORTED = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
] as DATE_TYPES[];

@Editor({ type: 'date' })
export class DateEditorService
  implements iBuilderEditor<DateEditorEditorOptions>
{
  constructor(
    private readonly keyboard: KeyboardManagerService,
    private readonly keymap: KeymapService,
    private readonly screen: ScreenService,
    private readonly textRendering: TextRenderingService,
  ) {}

  private chronoText: string;
  private complete = false;
  private config: DateEditorEditorOptions;
  private day: string;
  private done: (type: string | string[]) => void;
  private edit: DATE_TYPES = 'year';
  private end: boolean;
  private endDay: string;
  private endHour: string;
  private endMinute: string;
  private endMonth: string;
  private endSecond: string;
  private endYear: string;
  private error = '';
  private fuzzy: boolean;
  private hour: string;
  private localDirty: boolean;
  private minute: string;
  private month: string;
  private second: string;
  private type: tDateType;
  private value: dayjs.Dayjs | dayjs.Dayjs[];
  private year: string;

  private get editField(): string {
    if (this.end) {
      const property =
        this.edit.charAt(START).toUpperCase() + this.edit.slice(SINGLE);
      return `end${property}`;
    }
    return this.edit;
  }

  public configure(
    config: DateEditorEditorOptions,
    done: (type: unknown) => void,
  ): void {
    this.error = '';
    this.chronoText = '';
    this.config = config;
    config.fuzzy ??= 'user';
    this.type = config.type ?? 'datetime';
    // default off
    // ? Make that @InjectConfig controlled?
    this.fuzzy =
      (['datetime', 'range'] as tDateType[]).includes(this.type) &&
      config.fuzzy === 'always';
    this.complete = false;
    this.localDirty = false;
    this.value = dayjs(this.config.current);
    this.done = done;
    this.setKeymap();
    const start = Array.isArray(this.value) ? this.value[START] : this.value;
    this.edit = this.type === 'time' ? 'hour' : 'year';
    const end = Array.isArray(this.value)
      ? this.value[VALUE] ?? this.value[START]
      : this.value;
    [this.year, this.month, this.day, this.hour, this.minute, this.second] =
      start.format('YYYY-MM-DD-HH-mm-ss').split('-');

    [
      this.endYear,
      this.endMonth,
      this.endDay,
      this.endHour,
      this.endMinute,
      this.endSecond,
    ] = end.format('YYYY-MM-DD-HH-mm-ss').split('-');
  }

  public render(): void {
    if (this.complete) {
      this.renderComplete();
      return;
    }
    if (['datetime', 'range'].includes(this.type) && this.fuzzy) {
      this.renderChronoBox();
      return;
    }
    if (this.type === 'range') {
      this.renderRangeSections();
      return;
    }
    this.renderSections();
  }

  protected editType(key: string) {
    this.error = '';
    const field = this.editField;
    if (key === 'backspace') {
      this[field] = this[field].slice(START, SINGLE * INVERT_VALUE);
      this.localDirty = true;
      return;
    }
    if (!'1234567890'.includes(key)) {
      return;
    }
    const MAX_LENGTH = this.edit === 'year' ? 4 : 2;
    // If it's dirty + at max length, move cursor over first
    if (this.localDirty && this[field].length === MAX_LENGTH) {
      const index = SORTED.indexOf(this.edit);
      // No place to move it over. Give up
      if (index === SORTED.length - ARRAY_OFFSET) {
        return;
      }
      this.onRight();
    }
    if (!this.localDirty) {
      this[field] = key;
      this.localDirty = true;
      return;
    }
    if (!this.sanityCheck(this[this.edit] + key)) {
      return;
    }
    this[field] += key;
    if (this.edit === 'month') {
      this.updateMonth();
    }
    if (this[field].length === MAX_LENGTH) {
      this.onRight();
    }
  }

  protected onDown() {
    this.error = '';
    const current = Number(this[this.editField] || '0');
    if (current === 0) {
      return;
    }
    const previous = (current - INCREMENT)
      .toString()
      // lol 420
      .padStart(this.edit === 'year' ? 4 : 2, '0');
    if (!this.sanityCheck(previous)) {
      return;
    }
    this[this.editField] = previous;
    if (this.edit === 'month') {
      this.updateMonth();
    }
  }

  protected onEnd() {
    if (this.type == 'range') {
      return this.onEndRange();
    }
    if (this.fuzzy && is.empty(this.chronoText)) {
      this.error = chalk.red`Enter a value`;
      this.render();
      return false;
    }
    if (this.fuzzy) {
      const [result] = parse(this.chronoText);
      if (result.end) {
        this.error = chalk.red`Expression cannot result in a date range`;
        this.render();
        return false;
      }
    }
    this.value = dayjs(
      this.fuzzy
        ? parseDate(this.chronoText)
        : new Date(
            Number(this.year),
            Number(this.month) - ARRAY_OFFSET,
            Number(this.day),
            Number(this.hour),
            Number(this.minute),
            Number(this.second),
          ),
    );
    this.complete = true;
    this.render();
    this.done(this.value.toISOString());
    return false;
  }

  protected onKeyPress(key: string, { shift }: KeyModifiers) {
    this.error = '';
    if (key === 'backspace') {
      this.chronoText = this.chronoText.slice(START, INVERT_VALUE);
      return;
    }
    if (key === 'space') {
      this.chronoText += ' ';
      return;
    }
    if (key === 'tab') {
      return;
    }
    if (key.length > SINGLE) {
      return;
    }
    this.chronoText += shift ? key.toUpperCase() : key;
  }

  protected onLeft(): void {
    this.error = '';
    const index = SORTED.indexOf(this.edit);
    if (index === START || (this.type == 'time' && this.edit === 'hour')) {
      return;
    }
    this[this.editField] = this[this.editField].padStart(
      this.edit === 'year' ? 4 : 2,
      '0',
    );
    this.edit = SORTED[index - INCREMENT];
    this.localDirty = false;
  }

  protected onRight(): void {
    this.error = '';
    const index = SORTED.indexOf(this.edit);
    if (index === SORTED.length - ARRAY_OFFSET) {
      return;
    }
    this[this.editField] = this[this.editField].padStart(
      this.edit === 'year' ? 4 : 2,
      '0',
    );
    this.edit = SORTED[index + INCREMENT];
    this.localDirty = false;
  }

  protected onUp(): void {
    this.error = '';
    const next = (Number(this[this.editField] || '0') + INCREMENT)
      .toString()
      .padStart(this.edit === 'year' ? 4 : 2, '0');
    if (!this.sanityCheck(next)) {
      return;
    }
    this[this.editField] = next;
    this.localDirty = true;
    if (this.edit === 'month') {
      this.updateMonth();
    }
  }

  protected reset(): void {
    this.localDirty = false;
    this.chronoText = '';
  }

  protected setEnd(): void {
    this.edit = 'second';
    this.localDirty = false;
  }

  protected setHome(): void {
    this.edit = this.type === 'time' ? 'hour' : 'year';
    this.localDirty = false;
  }

  protected setMax(): void {
    this.localDirty = true;
    switch (this.edit) {
      // year omitted on purpose
      // Not sure what values would make sense to use
      case 'month':
        this[this.editField] = '12';
        return;
      case 'day':
        this[this.editField] = MONTH_MAX.get(
          Number(this.end ? this.endMonth || '1' : this.month),
        ).toString();
        return;
      case 'hour':
        this[this.editField] = '23';
        return;
      case 'minute':
      case 'second':
        this[this.editField] = '59';
        return;
    }
  }

  protected setMin(): void {
    this.localDirty = true;
    switch (this.edit) {
      // year omitted on purpose
      // Not sure what values would make sense to use
      case 'month':
      case 'day':
        this[this.editField] = '01';
        return;
      case 'hour':
      case 'minute':
      case 'second':
        this[this.editField] = '00';
        return;
    }
  }

  protected toggleChrono(): void {
    this.error = '';
    this.fuzzy = !this.fuzzy;
    this.setKeymap();
  }

  protected toggleRangeSide(): void {
    this.end = !this.end;
  }

  private onEndRange(): boolean {
    if (this.fuzzy) {
      if (is.empty(this.chronoText)) {
        this.error = chalk`{red Enter a value}`;
        this.render();
        return;
      }
      const [result] = parse(this.chronoText);
      if (!result.end) {
        this.error = chalk`{red Value must result in a date range}`;
        this.render();
        return;
      }
      this.value = [dayjs(result.start.date()), dayjs(result.end.date())];
    } else {
      this.value = [
        dayjs(
          new Date(
            Number(this.year),
            Number(this.month) - ARRAY_OFFSET,
            Number(this.day),
            Number(this.hour),
            Number(this.minute),
            Number(this.second),
          ),
        ),
        dayjs(
          new Date(
            Number(this.endYear),
            Number(this.endMonth) - ARRAY_OFFSET,
            Number(this.endDay),
            Number(this.endHour),
            Number(this.endMinute),
            Number(this.endSecond),
          ),
        ),
      ];
    }
    this.complete = true;
    this.render();
    this.done(this.value.map(i => i.toISOString()));
    return false;
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderChronoBox(): void {
    const placeholder =
      this.type === 'range' ? DEFAULT_RANGE_PLACEHOLDER : DEFAULT_PLACEHOLDER;
    let value = is.empty(this.chronoText) ? placeholder : this.chronoText;
    const out: string[] = [];
    if (this.config.label) {
      out.push(chalk`{green ? } ${this.config.label}`);
    }

    const stripped = ansiStrip(value);
    let length = stripped.length;
    if (length > PADDING - ELLIPSES.length) {
      const update =
        ELLIPSES + stripped.slice((PADDING - ELLIPSES.length) * INVERT_VALUE);
      value = value.replace(stripped, update);
      length = update.length;
    }
    const [result] = parse(this.chronoText.trim() || placeholder);
    out.push(
      chalk` {cyan >} {bold Input value}`,
      chalk[is.empty(this.chronoText) ? 'bgBlue' : 'bgWhite'].black(
        ansiPadEnd(INTERNAL_PADDING + value + INTERNAL_PADDING, PADDING),
      ),
    );
    if (result) {
      const { start, end } = result;
      out.push(
        chalk`\n {cyan >} {bold Resolved value}`,
        (end ? chalk.bold('Start: ') : '') + start.date().toLocaleString(),
      );
      if (end) {
        out.push(
          chalk`  {bold End:} ${end ? end.date().toLocaleString() : ''}`,
        );
      }
    } else {
      out.push(
        '',
        chalk` {cyan >} {bold.red Resolved value}\n{bgYellow.black CANNOT PARSE}`,
      );
    }
    const message = this.textRendering.pad(out.join(`\n`));
    this.screen.render(
      message,
      (!is.empty(this.error) ? chalk`\n{red.bold ! }${this.error}\n` : '') +
        this.keymap.keymapHelp({
          message,
        }),
    );
  }

  private renderComplete(): void {
    let message = ``;
    if (Array.isArray(this.value)) {
      const [from, to] = this.value;
      message += [
        ``,
        chalk`{bold From:} ${from.toDate().toLocaleString()}`,
        chalk`{bold   To:} ${to.toDate().toLocaleString()}`,
      ].join(`\n`);
    } else {
      const label = this.config.label || this.type === 'time' ? 'Time' : 'Date';
      message += chalk`{green ? } {bold ${label}: }`;
      switch (this.type) {
        case 'time':
          message += this.value.toDate().toLocaleTimeString();
          break;
        case 'date':
          message += this.value.toDate().toLocaleDateString();
          break;
        default:
          message += this.value.toDate().toLocaleString();
      }
    }
    this.screen.render(message);
  }

  /**
   * TODO: refactor these render sections methods into something more sane
   * This is super ugly
   */
  // eslint-disable-next-line radar/cognitive-complexity
  private renderRangeSections(): void {
    let message = chalk`  {green ? } ${
      this.config.label ?? chalk.bold`Enter date range`
    }  \n{bold From:} `;
    // From
    if (['range', 'date', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'year' && !this.end
          ? chalk[is.empty(this.year) ? 'bgBlue' : 'bgWhite'].black(
              this.year.padEnd(4, ' '),
            )
          : this.year.padEnd(4, ' ');
      message += `-`;
      message +=
        this.edit === 'month' && !this.end
          ? chalk[is.empty(this.month) ? 'bgBlue' : 'bgWhite'].black(
              this.month.padEnd(2, ' '),
            )
          : this.month.padEnd(2, ' ');
      message += `-`;
      message +=
        this.edit === 'day' && !this.end
          ? chalk[is.empty(this.day) ? 'bgBlue' : 'bgWhite'].black(
              this.day.padEnd(2, ' '),
            )
          : this.day.padEnd(2, ' ');
      message += ` `;
    }
    if (['range', 'time', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'hour' && !this.end
          ? chalk[is.empty(this.hour) ? 'bgBlue' : 'bgWhite'].black(
              this.hour.padEnd(2, ' '),
            )
          : this.hour.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'minute' && !this.end
          ? chalk[is.empty(this.minute) ? 'bgBlue' : 'bgWhite'].black(
              this.minute.padEnd(2, ' '),
            )
          : this.minute.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'second' && !this.end
          ? chalk[is.empty(this.second) ? 'bgBlue' : 'bgWhite'].black(
              this.second.padEnd(2, ' '),
            )
          : this.second.padEnd(2, ' ');
    }
    message += chalk`\n  {bold To:} `;
    // To
    if (['range', 'date', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'year' && this.end
          ? chalk[is.empty(this.endYear) ? 'bgBlue' : 'bgWhite'].black(
              this.endYear.padEnd(4, ' '),
            )
          : this.endYear.padEnd(4, ' ');
      message += `-`;
      message +=
        this.edit === 'month' && this.end
          ? chalk[is.empty(this.endMonth) ? 'bgBlue' : 'bgWhite'].black(
              this.endMonth.padEnd(2, ' '),
            )
          : this.endMonth.padEnd(2, ' ');
      message += `-`;
      message +=
        this.edit === 'day' && this.end
          ? chalk[is.empty(this.endDay) ? 'bgBlue' : 'bgWhite'].black(
              this.endDay.padEnd(2, ' '),
            )
          : this.endDay.padEnd(2, ' ');
      message += ` `;
    }
    if (['range', 'time', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'hour' && this.end
          ? chalk[is.empty(this.endHour) ? 'bgBlue' : 'bgWhite'].black(
              this.endHour.padEnd(2, ' '),
            )
          : this.endHour.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'minute' && this.end
          ? chalk[is.empty(this.endMinute) ? 'bgBlue' : 'bgWhite'].black(
              this.endMinute.padEnd(2, ' '),
            )
          : this.endMinute.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'second' && this.end
          ? chalk[is.empty(this.endSecond) ? 'bgBlue' : 'bgWhite'].black(
              this.endSecond.padEnd(2, ' '),
            )
          : this.endSecond.padEnd(2, ' ');
    }
    this.screen.render(
      message,
      (!is.empty(this.error) ? chalk`\n{red.bold ! }${this.error}\n` : '') +
        this.keymap.keymapHelp({
          message,
        }),
    );
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderSections(): void {
    let message = chalk`  {green ? } ${
      this.config.label ?? (this.type === 'time' ? 'Enter time' : 'Enter date')
    }  `;
    if (['range', 'date', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'year'
          ? chalk[is.empty(this.year) ? 'bgBlue' : 'bgWhite'].black(
              this.year.padEnd(4, ' '),
            )
          : this.year.padEnd(4, ' ');
      message += `-`;
      message +=
        this.edit === 'month'
          ? chalk[is.empty(this.month) ? 'bgBlue' : 'bgWhite'].black(
              this.month.padEnd(2, ' '),
            )
          : this.month.padEnd(2, ' ');
      message += `-`;
      message +=
        this.edit === 'day'
          ? chalk[is.empty(this.day) ? 'bgBlue' : 'bgWhite'].black(
              this.day.padEnd(2, ' '),
            )
          : this.day.padEnd(2, ' ');
      message += ` `;
    }
    if (['range', 'time', 'datetime'].includes(this.type)) {
      message +=
        this.edit === 'hour'
          ? chalk[is.empty(this.hour) ? 'bgBlue' : 'bgWhite'].black(
              this.hour.padEnd(2, ' '),
            )
          : this.hour.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'minute'
          ? chalk[is.empty(this.minute) ? 'bgBlue' : 'bgWhite'].black(
              this.minute.padEnd(2, ' '),
            )
          : this.minute.padEnd(2, ' ');
      message += `:`;
      message +=
        this.edit === 'second'
          ? chalk[is.empty(this.second) ? 'bgBlue' : 'bgWhite'].black(
              this.second.padEnd(2, ' '),
            )
          : this.second.padEnd(2, ' ');
    }
    this.screen.render(
      message,
      (!is.empty(this.error) ? chalk`\n{red.bold ! }${this.error}\n` : '') +
        this.keymap.keymapHelp({
          message,
        }),
    );
  }

  private sanityCheck(update: string): boolean {
    const value = Number(update);
    switch (this.edit) {
      case 'year':
        return update.length <= 4;
      case 'month':
        // Using real month nombers, not 0-11 like some sort of demented monkey
        return value <= 12 && value > 0;
      case 'hour':
        // midnight = 0, 11pm = 23
        return value <= 23 && value >= 0;
      case 'minute':
      case 'second':
        // 0-59
        return value >= 0 && value < 60;
      case 'day':
        return value > 0 && value <= MONTH_MAX.get(Number(this.month) || 1);
    }
    return false;
  }

  private setKeymap() {
    const FUZZY_KEYMAP: tKeyMap = new Map<TTYKeypressOptions, string>([
      [{ catchAll: true, powerUser: true }, 'onKeyPress'],
      [{ description: 'done', key: 'enter' }, 'onEnd'],
      [{ description: 'clear', key: 'escape' }, 'reset'],
      ...(this.config.fuzzy === 'user'
        ? [
            [{ description: 'input formatted', key: 'f3' }, 'toggleChrono'] as [
              TTYKeypressOptions,
              string,
            ],
          ]
        : []),
    ]);
    const NORMAL_KEYMAP: tKeyMap = new Map<TTYKeypressOptions, string>([
      [{ description: 'done', key: 'enter' }, 'onEnd'],
      [{ key: 'escape' }, 'reset'],
      [{ description: 'down', key: 'down' }, 'onDown'],
      [{ description: 'up', key: 'up' }, 'onUp'],
      [{ catchAll: true, powerUser: true }, 'editType'],
      [{ description: 'cursor left', key: 'left' }, 'onLeft'],
      [{ description: 'cursor right', key: 'right' }, 'onRight'],
      // Other common keys, feels excessive to report them to the user
      [{ key: [':', '-', 'space'], powerUser: true }, 'onRight'],
      ...(['datetime', 'range'].includes(this.type) &&
      this.config.fuzzy === 'user'
        ? [
            [{ description: 'natural parser', key: 'f3' }, 'toggleChrono'] as [
              TTYKeypressOptions,
              string,
            ],
          ]
        : []),
      ...(this.type === 'range'
        ? [
            [
              { description: 'toggle from / to', key: 'tab' },
              'toggleRangeSide',
            ] as [TTYKeypressOptions, string],
          ]
        : []),
      // "power user features"
      // aka: stuff I'm keeping off the help menu because it's getting cluttered
      [{ key: 'home', powerUser: true }, 'setHome'],
      [{ key: 'end', powerUser: true }, 'setEnd'],
      [{ key: 'pageup', powerUser: true }, 'setMax'],
      [{ key: 'pagedown', powerUser: true }, 'setMin'],
    ]);

    this.keyboard.setKeyMap(this, this.fuzzy ? FUZZY_KEYMAP : NORMAL_KEYMAP);
  }

  private updateMonth(): void {
    // Because I'm consistent like that
    const limit = MONTH_MAX.get(Number(this.month)) ?? 28;
    const day = Number(this.day) ?? 1;
    if (day > limit) {
      this.day = limit.toString();
    }
  }
}
