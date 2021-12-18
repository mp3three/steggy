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

import { ICONS } from '../contracts';
import { ansiMaxLength, ansiPadEnd } from '../includes';
import { TextRenderingService } from '../services';
import { MenuEntry } from './main-menu';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

type KeyDescriptor = { key: Key; value?: string };
type tCallback = (value: unknown[]) => void;

export interface ListBuilderOptions<T = unknown> {
  current?: MenuEntry<T | string>[];
  items?: string;
  source: MenuEntry<T | string>[];
}

const SINGLE_ITEM = 1;
const BASE_HELP = [
  ['arrows', 'move cursor'],
  ['enter', 'select entry'],
  ['home', 'move to top'],
  ['end', 'move to bottom'],
  ['f3', 'toggle find mode'],
] as MenuEntry[];

const MENU_HELP = [
  ['d', 'Done'],
  ['f4,`', 'Toggle'],
  ['i', 'Inverse'],
  ['[', `Select all`],
  [']', 'Remove all'],
  ['f12', 'Reset'],
  ['c', 'Cancel'],
] as MenuEntry[];

const SEARCH_HELP = [['f4,`', 'Toggle entry']] as MenuEntry[];

export class ListBuilderPrompt extends Base<Question & ListBuilderOptions> {
  private static app: INestApplication;
  public static onPreInit(app: INestApplication): void {
    this.app = app;
  }

  constructor(questions, rl, answers) {
    super(questions, rl, answers);
    this.opt = questions;
    this.current = [...this.opt.current];
    this.source = [...this.opt.source];
    const { app } = ListBuilderPrompt;
    this.textRender = app.get(TextRenderingService);
    this.opt.items ??= `Items`;
  }

  private current: MenuEntry<unknown>[];
  private done: tCallback;
  private mode: 'find' | 'select' = 'select';
  private numericSelection = '';
  private searchText = '';
  private selectedType: 'current' | 'source' = 'source';
  private source: MenuEntry<unknown>[];
  private readonly textRender: TextRenderingService;
  private value: unknown;

  public _run(callback: tCallback): this {
    this.done = callback;
    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    this.value ??= IsEmpty(this.source)
      ? this.current[START][VALUE]
      : this.source[START][VALUE];
    this.detectSide();
    cliCursor.hide();
    this.render();
    return this;
  }

  private add(): void {
    if (this.selectedType === 'current') {
      return;
    }
    // retrieve source list (prior to removal)
    const source = this.side('source', false);

    // Move item to current list
    const item = this.source.find(
      (item) => item[VALUE] === this.value,
    ) as MenuEntry<string>;
    this.current.push(item);
    // Remove from source
    this.source = this.source.filter((check) => check[VALUE] !== this.value);

    // Find move item in original source list
    const index = source.findIndex((i) => i[VALUE] === this.value);

    // If at bottom, move up one
    if (index === source.length - ARRAY_OFFSET) {
      // If only item, flip sides
      if (index === START) {
        this.selectedType = 'current';
        return;
      }
      this.value = source[index - INCREMENT][VALUE];
      return;
    }
    // If not bottom, move down one
    this.value = source[index + INCREMENT][VALUE];
  }

  private bottom(): void {
    const list = this.side();
    this.value = list[list.length - ARRAY_OFFSET][VALUE];
  }

  private detectSide(): void {
    const isLeftSide = this.side('current').some(
      (i) => i[VALUE] === this.value,
    );
    this.selectedType = isLeftSide ? 'current' : 'source';
  }

  private filterMenu(data: MenuEntry[], updateValue = false): MenuEntry[] {
    const highlighted = this.textRender.fuzzySort(this.searchText, data);
    if (IsEmpty(highlighted) || updateValue === false) {
      return highlighted;
    }
    this.value = highlighted[START][VALUE];
    return highlighted;
  }

  private getSelected(): MenuEntry {
    const list = [...this.opt.current, ...this.opt.source];
    const out = list.find((i) => i[VALUE] === this.value);
    return (out ?? list[START]) as MenuEntry;
  }

  private navigateSearch(key: string): void {
    const all = this.side();
    let available = this.filterMenu(all);
    if (IsEmpty(available)) {
      available = all;
    }
    if (['pageup', 'home'].includes(key)) {
      this.value = available[START][VALUE];
      return this.render();
    }
    if (['pagedown', 'end'].includes(key)) {
      this.value = available[available.length - ARRAY_OFFSET][VALUE];
      return this.render();
    }
    const index = available.findIndex((entry) => entry[VALUE] === this.value);
    if (index === NOT_FOUND) {
      this.value = available[START][VALUE];
      return this.render();
    }
    if (index === START && key === 'up') {
      this.value = available[available.length - ARRAY_OFFSET][VALUE];
    } else if (index === available.length - ARRAY_OFFSET && key === 'down') {
      this.value = available[START][VALUE];
    } else {
      this.value =
        available[key === 'up' ? index - INCREMENT : index + INCREMENT][VALUE];
    }
    return this.render();
  }

  private next(): void {
    const list = this.side();
    const index = list.findIndex((i) => i[VALUE] === this.value);
    if (index === NOT_FOUND) {
      this.value = list[FIRST][VALUE];
      return;
    }
    if (index === list.length - ARRAY_OFFSET) {
      // Loop around
      this.value = list[FIRST][VALUE];
      return;
    }
    this.value = list[index + INCREMENT][VALUE];
  }

  private onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done(this.current.map((i) => i[VALUE]));
  }

  private onKeypress({ key }: KeyDescriptor): void {
    if (this.status === 'answered') {
      return;
    }
    const mixed = key.name ?? key.sequence;
    if ((key.ctrl && mixed === 'f') || mixed === 'f3') {
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
    const [left, right] = [
      this.side('current', true),
      this.side('source', true),
    ];
    if (IsEmpty(left) || this.selectedType === 'current') {
      return;
    }
    this.selectedType = 'current';
    let current = right.findIndex((i) => i[VALUE] === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > left.length) {
      current = left.length - ARRAY_OFFSET;
    }
    this.value =
      left.length < current
        ? left[left.length - ARRAY_OFFSET][VALUE]
        : left[current][VALUE];
  }

  private onMenuKeypress(mixed: string): void {
    switch (mixed) {
      case 'i':
        const temporary = this.source;
        this.source = this.current;
        this.current = temporary;
        this.detectSide();
        break;
      case '[':
        this.current = [...this.current, ...this.source];
        this.source = [];
        this.detectSide();
        break;
      case ']':
        this.source = [...this.current, ...this.source];
        this.current = [];
        this.detectSide();
        break;
      case '`':
      case 'f4':
        if (this.selectedType === 'current') {
          this.remove();
        } else {
          this.add();
        }
        break;
      case 'f12':
        this.current = [...this.opt.current];
        this.source = [...this.opt.source];
        break;
      case 'c':
        this.current = [...this.opt.current];
      // fall through
      case 'd':
        this.onEnd();
        break;
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
        if ('0123456789'.includes(mixed)) {
          this.numericSelection = mixed;
          this.value =
            this.side()[
              Number(
                IsEmpty(this.numericSelection) ? '1' : this.numericSelection,
              ) - ARRAY_OFFSET
            ][VALUE] ?? this.value;

          this.render();
        }
    }
    this.render();
  }

  private onRight(): void {
    const [right, left] = [
      this.side('source', true),
      this.side('current', true),
    ];
    if (this.selectedType === 'source' || IsEmpty(right)) {
      return;
    }
    this.selectedType = 'source';
    let current = left.findIndex((i) => i[VALUE] === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > right.length) {
      current = right.length - ARRAY_OFFSET;
    }
    this.value =
      right.length - ARRAY_OFFSET < current
        ? right[right.length - ARRAY_OFFSET][VALUE]
        : right[current][VALUE];
  }

  private onSearchKeyPress(key: string): void {
    switch (key) {
      case 'backspace':
        this.searchText = this.searchText.slice(
          START,
          ARRAY_OFFSET * INVERT_VALUE,
        );
        return this.render(true);
      case '`':
      case 'f4':
        if (this.selectedType === 'current') {
          this.remove();
        } else {
          this.add();
        }
        return this.render();
      case 'left':
        this.onLeft();
        return this.render();
      case 'right':
        this.onRight();
        return this.render();
      case 'space':
        this.searchText += ' ';
        if (IsEmpty(this.side())) {
          this.selectedType =
            this.selectedType === 'source' ? 'current' : 'source';
        }
        return this.render(true);

      case 'up':
      case 'down':
      case 'home':
      case 'pageup':
      case 'end':
      case 'pagedown':
        this.navigateSearch(key);
        return;
    }
    if (key.length > SINGLE_ITEM) {
      return;
    }
    this.searchText += key;
    if (IsEmpty(this.side())) {
      this.selectedType = this.selectedType === 'source' ? 'current' : 'source';
    }
    this.render(true);
  }

  private previous(): void {
    const list = this.side();
    const index = list.findIndex((i) => i[VALUE] === this.value);
    if (index === NOT_FOUND) {
      this.value = list[FIRST][VALUE];
      return;
    }
    if (index === FIRST) {
      // Loop around
      this.value = list[list.length - ARRAY_OFFSET][VALUE];
      return;
    }
    this.value = list[index - INCREMENT][VALUE];
  }

  private remove(): void {
    if (this.selectedType === 'source') {
      return;
    }
    // retrieve current list (prior to removal)
    const current = this.side('current', false);

    // Move item to current list
    const item = this.current.find(
      (item) => item[VALUE] === this.value,
    ) as MenuEntry<string>;
    this.source.push(item);
    // Remove from source
    this.current = this.current.filter((check) => check[VALUE] !== this.value);

    // Find move item in original source list
    const index = current.findIndex((i) => i[VALUE] === this.value);

    // If at bottom, move up one
    if (index === current.length - ARRAY_OFFSET) {
      // If only item, flip sides
      if (index === START) {
        this.selectedType = 'current';
        return;
      }
      this.value = current[index - INCREMENT][VALUE];
      return;
    }
    // If not bottom, move down one
    this.value = current[index + INCREMENT][VALUE];
  }

  private render(updateValue = false): void {
    if (this.status === 'answered') {
      if (IsEmpty(this.current)) {
        this.screen.render(
          chalk` {magenta >} No ${this.opt.items} selected\n `,
          '',
        );
        return;
      }
      this.screen.render(
        chalk` {magenta >} {yellow ${this.current.length}} ${this.opt.items} selected\n `,
        '',
      );
      return;
    }
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }
    const left = `Current ${this.opt.items}`;
    const right = `Available ${this.opt.items}`;
    const current = this.renderSide(
      'current',
      updateValue && this.selectedType === 'current',
    );
    const source = this.renderSide(
      'source',
      updateValue && this.selectedType === 'source',
    );
    const search = this.mode === 'find' ? this.searchText : undefined;
    const message = this.textRender.assemble(current, source, {
      left,
      right,
      search,
    });
    this.screen.render(
      this.textRender.appendHelp(
        message.join(`\n`),
        BASE_HELP,
        this.mode === 'find' ? SEARCH_HELP : MENU_HELP,
      ),
      '',
    );
  }

  private renderSide(
    side: 'current' | 'source' = this.selectedType,
    updateValue = false,
  ): string[] {
    const out: string[] = [];
    let menu = this.side(side, true);
    if (this.mode === 'find' && !IsEmpty(this.searchText)) {
      menu = this.filterMenu(menu, updateValue);
    }
    const maxLabel =
      ansiMaxLength(menu.map((entry) => entry[LABEL])) + ARRAY_OFFSET;
    if (IsEmpty(menu)) {
      out.push(chalk.bold` ${ICONS.MANUAL}{gray.inverse  List is empty } `);
    }
    menu.forEach((item) => {
      const inverse = item[VALUE] === this.value;
      const padded = ansiPadEnd(item[LABEL], maxLabel);
      if (this.selectedType === side) {
        out.push(
          chalk` {${inverse ? 'bgCyanBright.black' : 'white'}  ${padded} }`,
        );
        return;
      }
      out.push(chalk` {gray  ${padded} }`);
    });
    return out;
  }

  private side<T extends unknown = string>(
    side: 'current' | 'source' = this.selectedType,
    range = false,
  ): MenuEntry<T>[] {
    if (range) {
      return this.textRender.selectRange(this.side(side, false), this.value);
    }
    if (this.mode === 'find') {
      return this.textRender.fuzzySort<T>(
        this.searchText,
        this[side] as MenuEntry<T>[],
      );
    }
    return this[side].sort((a, b) => {
      return a[LABEL].replace(UNSORTABLE, '') > b[LABEL].replace(UNSORTABLE, '')
        ? UP
        : DOWN;
    }) as MenuEntry<T>[];
  }

  private top(): void {
    const list = this.side();
    this.value = list[FIRST][VALUE];
  }
}
