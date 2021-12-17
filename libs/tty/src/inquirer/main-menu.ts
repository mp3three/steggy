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
import { INestApplication } from '@nestjs/common';
import chalk from 'chalk';
import cliCursor from 'cli-cursor';
import { Question } from 'inquirer';
import Base from 'inquirer/lib/prompts/base';
import observe from 'inquirer/lib/utils/events';
import { Key } from 'readline';

import { ICONS } from '..';
import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../includes';
import { PromptEntry, TextRenderingService } from '../services';

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
  keyMap: KeyMap;
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
const EMPTY_TEXT = chalk`{magenta   }`;

const BASE_HELP = [
  ['arrows', 'move cursor'],
  ['enter', 'select entry'],
  ['home', 'move to top'],
  ['end', 'move to bottom'],
  ['f3', 'toggle find mode'],
] as MenuEntry[];

export class MainMenuPrompt extends Base<Question & MainMenuOptions> {
  private static textRender: TextRenderingService;
  public static onPreInit(app: INestApplication): void {
    this.textRender = app.get(TextRenderingService);
  }

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
    this.textRender = MainMenuPrompt.textRender;
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
  private readonly textRender: TextRenderingService;
  private value: unknown;

  public _run(callback: tCallback): this {
    this.done = callback;
    const defaultValue = this.side('right')[START]?.entry[VALUE];
    this.value ??= defaultValue;
    this.detectSide();
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

  private detectSide(): void {
    const isLeftSide = this.side('left').some(
      (i) => i.entry[VALUE] === this.value,
    );
    this.selectedType = isLeftSide ? 'left' : 'right';
  }

  private filterMenu(
    data: MainMenuEntry[],
    updateValue = false,
  ): MainMenuEntry[] {
    const highlighted = this.textRender
      .fuzzySort(this.searchText, data.map(({ entry }) => entry) as MenuEntry[])
      .map((i) => {
        const item = data.find(({ entry }) => entry[VALUE] === i[VALUE]);
        return {
          ...item,
          entry: i,
        };
      });
    if (updateValue) {
      this.value = highlighted[START].entry[VALUE];
    }
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
    if (mixed === 'f3' || (key.ctrl && mixed === 'f')) {
      this.toggleFind();
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
      return this.render(true);
    }
    if (['up', 'down', 'home', 'pageup', 'end', 'pagedown'].includes(key)) {
      this.navigateSearch(key);
    }
    if (key === 'space') {
      this.searchText += ' ';
      return this.render(true);
    }
    if (key.length > SINGLE_ITEM) {
      if (typeof this.opt.keyMap[key] !== 'undefined') {
        this.value = this.opt.keyMap[key][VALUE];
        this.onEnd();
      }
      return;
    }
    this.searchText += key;
    this.render(true);
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

  private render(updateValue = false): void {
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
    this.renderFind(updateValue);
  }

  private renderFind(updateValue = false): void {
    this.screen.render(
      [
        ...this.textRender.searchBox(this.searchText),
        ...this.renderSide(undefined, false, updateValue),
      ].join(`\n`),
      '',
    );
  }

  private renderSelect() {
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }
    let message = '';
    const out = !IsEmpty(this.opt.left)
      ? this.textRender.assemble(
          this.renderSide('left'),
          this.renderSide('right'),
        )
      : this.renderSide('right');
    if (this.opt.showHeaders) {
      out[FIRST] = `\n  ${out[FIRST]}\n `;
    } else {
      message += `\n \n`;
    }
    message += out.map((i) => `  ${i}`).join(`\n`);
    const selectedItem = this.getSelected();
    if (typeof selectedItem.helpText === 'string') {
      message += chalk`\n \n {blue ?} ${selectedItem.helpText
        .split(`\n`)
        .map((line) => line.replace(new RegExp('^ -'), chalk.cyan('   -')))
        .join(`\n`)}`;
    } else if (this.showHelp) {
      message = this.textRender.appendHelp(
        message,
        BASE_HELP,
        Object.keys(this.opt.keyMap).map((i) => [i, this.opt.keyMap[i][VALUE]]),
      );
    }
    this.screen.render(message, '');
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private renderSide(
    side: 'left' | 'right' = this.selectedType,
    header = this.opt.showHeaders,
    updateValue = false,
  ): string[] {
    const out: string[] = [''];
    let menu = this.side(side);
    if (this.mode === 'find' && !IsEmpty(this.searchText)) {
      menu = this.filterMenu(menu, updateValue);
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
          chalk` {magenta.bold ${prefix}} {${
            inverse ? 'bgCyanBright.black' : 'white'
          }  ${padded}}`,
        );
        return;
      }
      out.push(chalk` {gray ${prefix}  {gray ${padded}}}`);
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

  private toggleFind(): void {
    this.mode = this.mode === 'find' ? 'select' : 'find';
    if (this.mode === 'select') {
      this.detectSide();
    } else {
      this.searchText = '';
    }
    this.render();
  }

  private top(): void {
    const list = this.side();
    this.value = list[FIRST].entry[VALUE];
  }
}
