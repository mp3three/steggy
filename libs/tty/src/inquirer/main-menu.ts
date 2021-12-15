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
} from '@ccontour/utilities';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';
import { Key } from 'readline';

import { PromptEntry } from '../services';

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}
const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

type KeyDescriptor = { key: Key; value?: string };
type tCallback = (value: unknown) => void;
export type MenuEntry<T extends unknown = string> = [string, T];
export interface MainMenuEntry<T = unknown> {
  entry: MenuEntry<T>;
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
        type: header.replace(ansiRegex(), ''),
      });
      return;
    }
    header = i.line;
  });
  return out;
}

export interface MainMenuOptions<T = unknown> {
  headerPadding?: number;
  keyMap?: Record<string, PromptEntry>;
  left?: MainMenuEntry<T>[];
  leftHeader?: string;
  right: MainMenuEntry<T>[];
  rightHeader?: string;
  showHelp?: boolean;
  titleTypes?: boolean;
  value?: unknown;
}

const DEFAULT_HEADER_PADDING = 4;
const MAX_SEARCH_SIZE = 50;
const EMPTY_TEXT = chalk`{magenta   }`;

const HELP_TEXT = [
  ``,
  ``,
  chalk.dim`{blue ----------------------------------------------------}`,
  chalk.dim` {blue -} {yellow Arrow keys} to navigate`,
  chalk.dim` {blue -} {yellow Enter} to select`,
  chalk.dim` {blue -} {yellow Page up/down} to move to ends of list`,
  chalk.dim` {blue -} {yellow ctrl-f} toggle find mode`,
].join(`\n `);

export class MainMenuPrompt extends Base<Question & MainMenuOptions> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);
    this.showHelp = this.opt.showHelp ?? true;
    this.opt = questions;
    this.opt.left ??= [];
    this.opt.right ??= [];
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
  private rightHeader: string;
  private searchText = '';
  private selectedType: 'left' | 'right' = 'right';
  private showHelp = true;
  private value: unknown;

  public _run(callback: tCallback): this {
    this.done = callback;
    const defaultValue = this.side('right')[START].entry[VALUE];
    this.value ??= defaultValue;
    this.selectedType = this.side('left').some(
      (i) => i.entry[VALUE] === this.value,
    )
      ? 'left'
      : 'right';
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
  private mergeLines(a: string[], b: string[]): string[] {
    const out = [...a];
    const maxA = Math.max(...out.map((i) => i.replace(ansiRegex(), '').length));
    const maxB = Math.max(...b.map((i) => i.replace(ansiRegex(), '').length));
    b.forEach((item, index) => {
      let current = (out[index] ?? '').padEnd(maxA, ' ');
      let stripped = current.replace(ansiRegex(), '');
      current += stripped.padEnd(maxA).slice(stripped.length);
      stripped = item.replace(ansiRegex(), ' ');
      item += stripped.padEnd(maxB, ' ').slice(stripped.length);
      const separator =
        index > a.length - ARRAY_OFFSET ? '' : chalk.cyan.dim('|');
      out[index] = chalk`${current}${separator} ${item}`;
    });
    return out;
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
    }
    this.render();
  }

  private onRight(): void {
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
    }
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
      this.screen.render(``, '');
      return;
    }
    if (this.mode === 'select') {
      return this.renderSelect();
    }
    this.renderFind();
  }

  private renderFind(): void {
    const searchText = IsEmpty(this.searchText)
      ? chalk.gray`Type to filter`
      : this.searchText;
    const out = [
      chalk` {green >} {cyan Search} `,
      chalk.bgWhite.black` ${searchText
        .replace(ansiRegex(), '')
        .padEnd(MAX_SEARCH_SIZE, ' ')} `,
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
    out[FIRST] = `\n  ${out[FIRST]}\n `;
    message += out.map((i) => `  ${i}`).join(`\n`);
    if (this.showHelp) {
      message += [
        HELP_TEXT,
        ...Object.keys(this.opt.keyMap).map(
          (key) =>
            chalk.dim`  {blue -} {yellow ${key}} ${this.opt.keyMap[key][LABEL]} `,
        ),
      ].join(`\n`);
    }
    this.screen.render(message, '');
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderSide(
    side: 'left' | 'right' = this.selectedType,
    header = true,
  ): string[] {
    const out: string[] = [''];
    const menu = this.side(side);
    const maxType = Math.max(
      ...menu.map(({ type }) => type.replace(ansiRegex(), '').length),
    );
    let last = '';
    menu.forEach((item) => {
      const stripped = item.type.replace(ansiRegex(), '');
      const padding = stripped.padEnd(maxType, ' ').slice(stripped.length);
      let prefix = item.type + padding;
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
      out.push(
        this.selectedType === side
          ? chalk`{magenta.bold ${prefix}} {${
              inverse ? 'bgCyan.black' : 'white'
            }  ${item.entry[LABEL]} }`
          : chalk`{gray ${prefix}  ${item.entry[LABEL]} }`,
      );
    });
    const max = Math.max(...out.map((i) => i.replace(ansiRegex(), '').length));
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

  private side(side: 'left' | 'right' = this.selectedType, noRecurse = false) {
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
