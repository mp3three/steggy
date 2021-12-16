import {
  ARRAY_OFFSET,
  DOWN,
  FIRST,
  INCREMENT,
  INVERT_VALUE,
  IsEmpty,
  LABEL,
  NOT_FOUND,
  START,
  TitleCase,
  UP,
  VALUE,
} from '@for-science/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import fuzzy from 'fuzzysort';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';
import { Key } from 'readline';

import { ICONS } from '..';
import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../includes';
import { PromptEntry } from '../services';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

type KeyDescriptor = { key: Key; value?: string };
type tCallback = (value: unknown) => void;
export type MenuEntry<T extends unknown = string> = [string, T];
export interface MainMenuEntry<T = unknown> {
  entry: MenuEntry<T>;
  helpText?: string;
  icon?: string;
  type?: string;
}

export function ToMenuEntry<T>(entries: PromptEntry<T>[]): MainMenuEntry<T>[] {
  const out: MainMenuEntry<T>[] = [];
  let header = '';
  entries.forEach((i) => {
    if (Array.isArray(i)) {
      out.push({
        entry: i as MenuEntry<T>,
        type: ansiStrip(header),
      });
      return;
    }
    header = i.line;
  });
  return out;
}
export type KeyMap = Record<string, PromptEntry>;

export interface MainMenuOptions<T = unknown> {
  headerPadding?: number;
  keyMap?: KeyMap;
  left?: MainMenuEntry<T | string>[];
  leftHeader?: string;
  right: MainMenuEntry<T | string>[];
  rightHeader?: string;
  showHeaders?: boolean;
  showHelp?: boolean;
  titleTypes?: boolean;
  value?: unknown;
}

const DEFAULT_HEADER_PADDING = 4;
const SINGLE_ITEM = 1;
const MAX_SEARCH_SIZE = 50;
const EMPTY_TEXT = chalk`{magenta   }`;
const TEMP_TEMPLATE_SIZE = 3;
const BIGGEST_KEYBIND = 6;

const HELP_TEXT = [
  // First line gets an extra space... because reasons?
  chalk`  {blue.dim -} {yellow.dim arrows}  {gray move cursor}`,
  chalk` {blue.dim -} {yellow.dim enter }  {gray select entry}`,
  chalk` {blue.dim -} {yellow.dim home  }  {gray move to top}`,
  chalk` {blue.dim -} {yellow.dim end   }  {gray move to bottom}`,
  chalk` {blue.dim -} {yellow.dim ctrl-f}  {gray toggle find mode}`,
].join(`\n `);

export class MainMenuPrompt extends Base<Question & MainMenuOptions> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
    this.showHelp = this.opt.showHelp ?? true;
    this.opt = questions;
    this.opt.left ??= [];
    this.opt.right ??= [];
    this.opt.showHeaders ??= !IsEmpty(this.opt.left);
    this.opt.left.forEach((i) => (i.type ??= ''));
    this.opt.right.forEach((i) => (i.type ??= ''));
    this.opt.keyMap ??= {};
    this.value = this.opt.value;
    this.headerPadding = this.opt.headerPadding ?? DEFAULT_HEADER_PADDING;
    this.rightHeader = this.opt.rightHeader ?? 'Menu';
    this.leftHeader = this.opt.leftHeader ?? 'Secondary';
  }

  private done: tCallback;
  private headerPadding: number;
  private leftHeader: string;
  private mode: 'find' | 'select' = 'select';
  private numericSelection = '';
  private rightHeader: string;
  private searchText = '';
  private selectedType: 'left' | 'right' = 'right';
  private showHelp = true;
  private value: unknown;

  public _run(callback: tCallback): this {
    this.done = callback;
    const defaultValue = this.side('right')[START]?.entry[VALUE];
    this.value ??= defaultValue;
    const isLeftSide = this.side('left').some(
      (i) => i.entry[VALUE] === this.value,
    );
    this.selectedType = isLeftSide ? 'left' : 'right';
    const contained = this.side().find((i) => i.entry[VALUE] === this.value);
    if (!contained) {
      this.value = defaultValue;
    }
    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    events.line.forEach(this.onEnd.bind(this));

    cliCursor.hide();
    this.render();
    return this;
  }

  private bottom(): void {
    const list = this.side();
    this.value = list[list.length - ARRAY_OFFSET].entry[VALUE];
  }

  private filterMenu(data: MainMenuEntry[]): MainMenuEntry[] {
    const entries = data.map((i) => ({
      label: i.entry[LABEL],
      value: i.entry[VALUE],
    }));
    const fuzzyResult = fuzzy.go(this.searchText, entries, { key: 'label' });
    const highlighted = fuzzyResult.map((result) => {
      const { target } = result;
      const item = data.find((option) => {
        return typeof option === 'string'
          ? option === target
          : option.entry[LABEL] === target;
      });
      return {
        ...item,
        entry: [this.highlight(result), item.entry[VALUE]],
      } as MainMenuEntry;
    });

    // ? Sticky to first is easier to use while going fast, sticky to current is better going slow (subjective)
    // Maybe make this a flag?

    //  * Sticky value to first item
    this.value = highlighted[START].entry[VALUE];

    //  * Sticky the value the current (until it disappears)
    // const contained = highlighted.some(
    //   ({ entry }) => entry[VALUE] === this.value,
    // );
    // if (!contained && !IsEmpty(highlighted)) {
    // this.value = highlighted[START].entry[VALUE];
    // }
    return highlighted;
  }

  private getSelected(): MainMenuEntry {
    const list = [
      ...this.opt.left,
      ...this.opt.right,
      ...Object.values(this.opt.keyMap).map(
        (entry) => ({ entry } as MainMenuEntry),
      ),
    ];
    const out = list.find((i) => i.entry[VALUE] === this.value);
    return out ?? list[START];
  }

  private highlight(result) {
    const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
    const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
    let highlighted = '';
    let matchesIndex = 0;
    let opened = false;
    const { target, indexes } = result;
    for (let i = START; i < target.length; i++) {
      const char = target[i];
      if (indexes[matchesIndex] === i) {
        matchesIndex++;
        if (!opened) {
          opened = true;
          highlighted += open;
        }
        if (matchesIndex === indexes.length) {
          highlighted += char + close + target.slice(i + INCREMENT);
          break;
        }
        highlighted += char;
        continue;
      }
      if (opened) {
        opened = false;
        highlighted += close;
      }
      highlighted += char;
    }
    return highlighted.replace(
      new RegExp(`${open}(.*?)${close}`, 'g'),
      (i) =>
        chalk.bgBlueBright`${i.slice(
          TEMP_TEMPLATE_SIZE,
          TEMP_TEMPLATE_SIZE * INVERT_VALUE,
        )}`,
    );
  }

  private mergeLines(a: string[], b: string[]): string[] {
    const out = [...a];
    const maxA = ansiMaxLength(a);
    const maxB = ansiMaxLength(b);
    b.forEach((item, index) => {
      const current = ansiPadEnd(out[index] ?? '', maxA);
      item = ansiPadEnd(item, maxB);
      const separator =
        index > a.length - ARRAY_OFFSET ? ' ' : chalk.cyan.dim('|');
      out[index] = chalk`${current}${separator} ${item}`;
    });
    return out;
  }

  private navigateSearch(key: string): void {
    const all = this.side();
    let available = this.filterMenu(all);
    if (IsEmpty(available)) {
      available = all;
    }
    if (['pageup', 'home'].includes(key)) {
      this.value = available[START].entry[VALUE];
      return this.render();
    }
    if (['pagedown', 'end'].includes(key)) {
      this.value = available[available.length - ARRAY_OFFSET].entry[VALUE];
      return this.render();
    }
    const index = available.findIndex(
      ({ entry }) => entry[VALUE] === this.value,
    );
    if (index === NOT_FOUND) {
      this.value = available[START].entry[VALUE];
      return this.render();
    }
    if (index === START && key === 'up') {
      this.value = available[available.length - ARRAY_OFFSET].entry[VALUE];
    } else if (index === available.length - ARRAY_OFFSET && key === 'down') {
      this.value = available[START].entry[VALUE];
    } else {
      this.value =
        available[key === 'up' ? index - INCREMENT : index + INCREMENT].entry[
          VALUE
        ];
    }
    return this.render();
  }

  private next(): void {
    const list = this.side();
    const index = list.findIndex((i) => i.entry[VALUE] === this.value);
    if (index === NOT_FOUND) {
      this.value = list[FIRST].entry[VALUE];
      return;
    }
    if (index === list.length - ARRAY_OFFSET) {
      // Loop around
      this.value = list[FIRST].entry[VALUE];
      return;
    }
    this.value = list[index + INCREMENT].entry[VALUE];
  }

  private onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done(this.value);
  }

  private onKeypress({ key }: KeyDescriptor): void {
    if (this.status === 'answered') {
      return;
    }
    const mixed = key.name ?? key.sequence;
    if (key.ctrl && mixed === 'f') {
      this.mode = this.mode === 'find' ? 'select' : 'find';
      this.searchText = '';
      this.render();
      return;
    }
    if (key.ctrl || key.shift || key.meta) {
      return;
    }
    if (this.mode === 'find') {
      this.onSearchKeyPress(mixed);
      return;
    }
    this.onMenuKeypress(mixed);
  }

  private onLeft(): void {
    const [right, left] = [this.side('right'), this.side('left')];
    if (IsEmpty(this.opt.left) || this.selectedType === 'left') {
      return;
    }
    this.selectedType = 'left';
    let current = right.findIndex((i) => i.entry[VALUE] === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > left.length) {
      current = left.length - ARRAY_OFFSET;
    }
    this.value =
      left.length < current
        ? left[left.length - ARRAY_OFFSET].entry[VALUE]
        : left[current].entry[VALUE];
  }

  private onMenuKeypress(mixed: string): void {
    switch (mixed) {
      case 'left':
        this.onLeft();
        break;
      case 'right':
        this.onRight();
        break;
      case 'home':
      case 'pageup':
        this.top();
        break;
      case 'end':
      case 'pagedown':
        this.bottom();
        break;
      case 'up':
        this.previous();
        break;
      case 'down':
        this.next();
        break;
      default:
        if (typeof this.opt.keyMap[mixed] !== 'undefined') {
          this.value = this.opt.keyMap[mixed][VALUE];
          this.onEnd();
          return;
        }
        if ('0123456789'.includes(mixed)) {
          this.numericSelection = mixed;
          this.value =
            this.side()[
              Number(
                IsEmpty(this.numericSelection) ? '1' : this.numericSelection,
              ) - ARRAY_OFFSET
            ]?.entry[VALUE] ?? this.value;

          this.render();
        }
    }
    this.render();
  }

  private onRight(): void {
    if (this.selectedType === 'right') {
      return;
    }
    const [right, left] = [this.side('right'), this.side('left')];
    this.selectedType = 'right';
    let current = left.findIndex((i) => i.entry[VALUE] === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > right.length) {
      current = right.length - ARRAY_OFFSET;
    }
    this.value =
      right.length - ARRAY_OFFSET < current
        ? right[right.length - ARRAY_OFFSET].entry[VALUE]
        : right[current].entry[VALUE];
  }

  private onSearchKeyPress(key: string): void {
    if (key === 'backspace') {
      this.searchText = this.searchText.slice(
        START,
        ARRAY_OFFSET * INVERT_VALUE,
      );
      return this.render();
    }
    if (['up', 'down', 'home', 'pageup', 'end', 'pagedown'].includes(key)) {
      this.navigateSearch(key);
    }
    if (key === 'space') {
      this.searchText += ' ';
      return this.render();
    }
    if (key.length > SINGLE_ITEM) {
      if (typeof this.opt.keyMap[key] !== 'undefined') {
        this.value = this.opt.keyMap[key][VALUE];
        this.onEnd();
      }
      return;
    }
    this.searchText += key;
    this.render();
  }

  private previous(): void {
    const list = this.side();
    const index = list.findIndex((i) => i.entry[VALUE] === this.value);
    if (index === NOT_FOUND) {
      this.value = list[FIRST].entry[VALUE];
      return;
    }
    if (index === FIRST) {
      // Loop around
      this.value = list[list.length - ARRAY_OFFSET].entry[VALUE];
      return;
    }
    this.value = list[index - INCREMENT].entry[VALUE];
  }

  private render(): void {
    if (this.status === 'answered') {
      const entry = this.getSelected();
      if (entry) {
        this.screen.render(chalk` {magenta >} ${entry.entry[LABEL]}`, '');
      }
      return;
    }
    if (this.mode === 'select') {
      return this.renderSelect();
    }
    this.renderFind();
  }

  private renderFind(): void {
    const searchText = IsEmpty(this.searchText)
      ? chalk.bgBlue`Type to filter`
      : this.searchText;
    const out = [
      chalk` {green >} {cyan Search} `,
      chalk[IsEmpty(this.searchText) ? 'bgBlue' : 'bgWhite']
        .black` ${ansiPadEnd(searchText, MAX_SEARCH_SIZE)} `,
      ` `,
      ...this.renderSide(undefined, false),
    ];
    this.screen.render(out.join(`\n`), '');
  }

  private renderSelect() {
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }
    let message = '';
    const out = !IsEmpty(this.opt.left)
      ? this.mergeLines(this.renderSide('left'), this.renderSide('right'))
      : this.renderSide('right');
    if (this.opt.showHeaders) {
      out[FIRST] = `\n  ${out[FIRST]}\n `;
    } else {
      message += `\n \n`;
    }
    message += out.map((i) => `  ${i}`).join(`\n`);
    const longestLine = Math.max(
      ...message.split(`\n`).map((i) => ansiStrip(i).length),
    );

    const selectedItem = this.getSelected();
    if (typeof selectedItem.helpText === 'string') {
      message += chalk`\n \n {blue ?} ${selectedItem.helpText
        .split(`\n`)
        .map((line) => line.replace(new RegExp('^ -'), chalk.cyan('   -')))
        .join(`\n`)}`;
    } else if (this.showHelp) {
      message += [
        ` `,
        ` `,
        chalk.blue.dim` ${'='.repeat(longestLine)}`,
        HELP_TEXT,
        ...Object.keys(this.opt.keyMap)
          .filter((key) => Array.isArray(this.opt.keyMap[key]))
          .sort((a, b) => {
            if (a.length > b.length) {
              return UP;
            }
            if (b.length > a.length) {
              return DOWN;
            }
            return a > b ? UP : DOWN;
          })
          .map(
            (key) =>
              // Mental note: keep space at end for rendering reasons
              chalk`  {blue.dim -} {yellow.dim ${key.padEnd(
                BIGGEST_KEYBIND,
                ' ',
              )}}  {gray ${this.opt.keyMap[key][LABEL]} }`,
          ),
      ].join(`\n`);
    }
    this.screen.render(message, '');
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderSide(
    side: 'left' | 'right' = this.selectedType,
    header = this.opt.showHeaders,
  ): string[] {
    const out: string[] = [''];
    let menu = this.side(side);
    if (this.mode === 'find' && !IsEmpty(this.searchText)) {
      menu = this.filterMenu(menu);
    }
    const maxType = ansiMaxLength(menu.map(({ type }) => type));
    let last = '';
    const maxLabel =
      ansiMaxLength(menu.map(({ entry }) => entry[LABEL])) + ARRAY_OFFSET;
    if (IsEmpty(menu)) {
      out.push(
        chalk.bold` ${ICONS.WARNING}{yellowBright.inverse  No actions to select from }`,
      );
    }
    menu.forEach((item) => {
      let prefix = ansiPadEnd(item.type, maxType);
      if (this.opt.titleTypes) {
        prefix = TitleCase(prefix);
      }
      if (last === prefix) {
        prefix = chalk(''.padEnd(maxType, ' '));
      } else {
        if (last !== '' && this.mode !== 'find') {
          out.push(EMPTY_TEXT);
        }
        last = prefix;
        prefix = chalk(prefix);
      }
      if (this.mode === 'find') {
        prefix = ``;
      }
      const inverse = item.entry[VALUE] === this.value;

      const padded = ansiPadEnd(item.entry[LABEL], maxLabel);

      if (this.selectedType === side) {
        out.push(
          chalk`{magenta.bold ${prefix}} {${
            inverse ? 'bgCyanBright.black' : 'white'
          }  ${padded} }`,
        );
        return;
      }
      out.push(chalk`{gray ${prefix}  {gray ${padded}} }`);
    });
    const max = ansiMaxLength(out);
    if (header) {
      if (side === 'left') {
        out[FIRST] = chalk.bold.blue.dim(
          `${this.leftHeader}${''.padEnd(this.headerPadding, ' ')}`.padStart(
            max,
            ' ',
          ),
        );
      } else {
        out[FIRST] = chalk.bold.blue.dim(
          `${''.padEnd(this.headerPadding, ' ')}${this.rightHeader}`.padEnd(
            max,
            ' ',
          ),
        );
      }
    } else {
      out.shift();
    }
    return out;
  }

  private side(
    side: 'left' | 'right' = this.selectedType,
    noRecurse = false,
  ): MainMenuEntry[] {
    if (this.mode === 'find' && !noRecurse) {
      return [...this.side('right', true), ...this.side('left', true)];
    }
    return this.opt[side].sort((a, b) => {
      if (a.type === b.type) {
        return a.entry[LABEL].replace(UNSORTABLE, '') >
          b.entry[LABEL].replace(UNSORTABLE, '')
          ? UP
          : DOWN;
      }
      if (a.type > b.type) {
        return UP;
      }
      return DOWN;
    });
  }

  private top(): void {
    const list = this.side();
    this.value = list[FIRST].entry[VALUE];
  }
}
