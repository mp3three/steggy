/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  ARRAY_OFFSET,
  INCREMENT,
  INVERT_VALUE,
  is,
  SINGLE,
  START,
} from '@steggy/utilities';
import chalk from 'chalk';
import { parseDate } from 'chrono-node';
import dayjs from 'dayjs';

import {
  InquirerKeypressOptions,
  KeyModifiers,
  tKeyMap,
} from '../../contracts';
import { Editor, iBuilderEditor } from '../../decorators';
import { ansiPadEnd, ansiStrip } from '../../includes';
import { KeyboardManagerService, ScreenService } from '../meta';
import { KeymapService, TextRenderingService } from '../render';

export interface DateEditorEditorOptions {
  current?: string;
  /**
   * Interpret values with chrono-node
   */
  fuzzy?: 'always' | 'never' | 'user';
  label?: string;
}

const MONTH_MAX = new Map([
  [1, 31],
  // Don't care about leap years beyond this
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
    private readonly keyboardService: KeyboardManagerService,
    private readonly keymap: KeymapService,
    private readonly screenService: ScreenService,
    private readonly textRendering: TextRenderingService,
  ) {}

  private chronoText: string;
  private complete = false;
  private config: DateEditorEditorOptions;
  private day: string;
  private done: (type: string) => void;
  private edit: DATE_TYPES = 'year';
  private fuzzy: boolean;
  private hour: string;
  private localDirty: boolean;
  private minute: string;
  private month: string;
  private second: string;
  private value: dayjs.Dayjs;
  private year: string;

  public configure(
    config: DateEditorEditorOptions,
    done: (type: unknown) => void,
  ): void {
    this.chronoText = '';
    this.config = config;
    config.fuzzy ??= 'user';
    // default off
    // ? Make that @InjectConfig controlled?
    this.fuzzy = config.fuzzy === 'always';
    this.complete = false;
    this.localDirty = false;
    this.value = dayjs(this.config.current);
    this.done = done;
    this.setKeymap();
    [this.year, this.month, this.day, this.hour, this.minute, this.second] =
      this.value.format('YYYY-MM-DD-HH-mm-ss').split('-');
  }

  public render(): void {
    if (this.complete) {
      this.screenService.render(
        chalk`{green ? } {bold ${this.config.label}} {gray ${this.value
          .toDate()
          .toLocaleString()}}`,
      );
      return;
    }
    if (this.fuzzy) {
      this.renderChronoBox();
      return;
    }
    this.renderSections();
  }

  protected editType(key: string) {
    if (key === 'backspace') {
      this[this.edit] = this[this.edit].slice(START, INVERT_VALUE);
      this.localDirty = true;
      return;
    }
    if (!'1234567890'.includes(key)) {
      return;
    }
    const MAX_LENGTH = this.edit === 'year' ? 4 : 2;
    // If it's dirty + at max length, move cursor over first
    if (this.localDirty && this[this.edit].length === MAX_LENGTH) {
      const index = SORTED.indexOf(this.edit);
      // No place to move it over. Give up
      if (index === SORTED.length - ARRAY_OFFSET) {
        return;
      }
      this.onRight();
    }
    if (!this.localDirty) {
      this[this.edit] = key;
      this.localDirty = true;
      return;
    }
    if (!this.sanityCheck(this[this.edit] + key)) {
      return;
    }
    this[this.edit] += key;
    if (this.edit === 'month') {
      this.updateMonth();
    }
    if (this[this.edit].length === MAX_LENGTH) {
      this.onRight();
    }
  }

  protected onDown() {
    const current = Number(this[this.edit] || '0');
    if (current === 0) {
      return;
    }
    const previous = (current - INCREMENT)
      .toString()
      .padStart(this.edit === 'year' ? 4 : 2, '0');
    if (!this.sanityCheck(previous)) {
      return;
    }
    this[this.edit] = previous;
    if (this.edit === 'month') {
      this.updateMonth();
    }
  }

  protected onEnd() {
    this.complete = true;
    this.value = dayjs(
      this.fuzzy
        ? parseDate(this.chronoText)
        : new Date(
            Number(this.year),
            Number(this.month),
            Number(this.day),
            Number(this.hour),
            Number(this.minute),
            Number(this.second),
          ),
    );
    this.render();
    this.done(this.value.toISOString());
    return false;
  }

  protected onKeyPress(key: string, { shift }: KeyModifiers) {
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
    const index = SORTED.indexOf(this.edit);
    if (index === START) {
      return;
    }
    this[this.edit] = this[this.edit].padStart(
      this.edit === 'year' ? 4 : 2,
      '0',
    );

    this.edit = SORTED[index - INCREMENT];
    this.localDirty = false;
  }

  protected onRight(): void {
    const index = SORTED.indexOf(this.edit);
    if (index === SORTED.length - ARRAY_OFFSET) {
      return;
    }
    this[this.edit] = this[this.edit].padStart(
      this.edit === 'year' ? 4 : 2,
      '0',
    );
    this.edit = SORTED[index + INCREMENT];
    this.localDirty = false;
  }

  protected onUp(): void {
    const next = (Number(this[this.edit] || '0') + INCREMENT)
      .toString()
      .padStart(this.edit === 'year' ? 4 : 2, '0');
    if (!this.sanityCheck(next)) {
      return;
    }
    this[this.edit] = next;
    this.localDirty = true;
    if (this.edit === 'month') {
      this.updateMonth();
    }
  }

  protected reset(): void {
    this.chronoText = '';
  }

  protected toggleChrono(): void {
    this.fuzzy = !this.fuzzy;
    this.setKeymap();
  }

  private renderChronoBox(): void {
    let value = is.empty(this.chronoText)
      ? DEFAULT_PLACEHOLDER
      : this.chronoText;
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
    const parsed = parseDate(this.chronoText || DEFAULT_PLACEHOLDER);
    out.push(
      chalk` {cyan >} {bold Input value}`,
      chalk[is.empty(this.chronoText) ? 'bgBlue' : 'bgWhite'].black(
        ansiPadEnd(INTERNAL_PADDING + value + INTERNAL_PADDING, PADDING),
      ),
      chalk`\n {cyan >} {bold Resolved value}`,
      parsed
        ? parsed.toLocaleString()
        : chalk.bgYellow.black(`  Cannot parse  `),
    );
    const message = this.textRendering.pad(out.join(`\n`));

    this.screenService.render(
      message,
      this.keymap.keymapHelp({
        message,
      }),
    );
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderSections(): void {
    let message = chalk`  {green ? } ${this.config.label ?? 'Enter date'}  `;
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
    this.screenService.render(
      message,
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
    const FUZZY_KEYMAP: tKeyMap = new Map<InquirerKeypressOptions, string>([
      [{ catchAll: true, noHelp: true }, 'onKeyPress'],
      [{ description: 'done', key: 'enter' }, 'onEnd'],
      [{ description: 'clear', key: 'escape' }, 'reset'],
      ...(this.config.fuzzy === 'user'
        ? [
            [{ description: 'input formatted', key: 'f3' }, 'toggleChrono'] as [
              InquirerKeypressOptions,
              string,
            ],
          ]
        : []),
    ]);
    const NORMAL_KEYMAP: tKeyMap = new Map<InquirerKeypressOptions, string>([
      [{ description: 'done', key: 'enter' }, 'onEnd'],
      [{ key: 'escape' }, 'reset'],
      [{ description: 'down', key: 'down' }, 'onDown'],
      [{ description: 'up', key: 'up' }, 'onUp'],
      [{ catchAll: true, noHelp: true }, 'editType'],
      [{ description: 'cursor left', key: 'left' }, 'onLeft'],
      [{ description: 'cursor right', key: 'right' }, 'onRight'],
      // Other common keys, feels excessive to report them to the user
      [{ key: [':', '-', 'space', 'tab'], noHelp: true }, 'onRight'],
      ...(this.config.fuzzy === 'user'
        ? [
            [{ description: 'natural parser', key: 'f3' }, 'toggleChrono'] as [
              InquirerKeypressOptions,
              string,
            ],
          ]
        : []),
    ]);

    this.keyboardService.setKeyMap(
      this,
      this.fuzzy ? FUZZY_KEYMAP : NORMAL_KEYMAP,
    );
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
