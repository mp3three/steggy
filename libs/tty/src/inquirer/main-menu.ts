import {
  ARRAY_OFFSET,
  DOWN,
  IsEmpty,
  LABEL,
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

import { PinnedItemDTO, PromptEntry } from '../services';

function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');

  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

type KeyDescriptor = { key: Key; value?: string };

type tCallback = (value: unknown) => void;

export interface MainMenuEntry<T = unknown> {
  entry: PromptEntry<T>;
  icon: string;
  type: string;
}
export interface PinnedItem<T = unknown> {
  entry: PromptEntry<T>;
  type: string;
}
export interface MainMenuOptions<T = unknown> {
  menu?: MainMenuEntry<T>[];
  pinned?: PinnedItem<T>[];
  value?: unknown;
}
const EMPTY_TEXT = chalk`{magenta   }`;

export class MainMenuPrompt extends Base<Question & MainMenuOptions> {
  constructor(questions, rl, answers) {
    super(questions, rl, answers);

    this.opt = questions;
    this.opt.pinned ??= [];
    this.opt.menu ??= [];
    this.value = this.opt.value;
  }

  private done: tCallback;
  private firstRender = true;
  private selectedLine = START;
  private selectedType: 'pinned' | 'menu' = 'menu';
  private value: unknown;

  private get entries() {
    return this.selectedType === 'menu'
      ? this.renderMenu()
      : this.renderPinned();
  }

  private get menu() {
    return this.opt.menu.sort((a, b) => {
      if (a.type === b.type) {
        return a.entry[LABEL] > b.entry[LABEL] ? UP : DOWN;
      }
      if (a.type > b.type) {
        return UP;
      }
      return DOWN;
    });
  }

  private get pinned() {
    return this.opt.pinned.sort((a, b) => {
      if (a.type > b.type) {
        return UP;
      }
      if (b.type > a.type) {
        return DOWN;
      }
      return a.entry[LABEL] > b.entry[LABEL] ? UP : DOWN;
    });
  }

  public _run(callback: tCallback): this {
    this.done = callback;

    if (this.value) {
      this.selectedType = typeof this.value === 'string' ? 'menu' : 'pinned';
      const entries = this.selectedType === 'menu' ? this.menu : this.pinned;
      const value = [...entries].find(
        ({ entry }: PinnedItem | MainMenuEntry) => {
          if (typeof this.value === 'object') {
            return entry[VALUE].id === (this.value as PinnedItemDTO).id;
          }
          return entry[VALUE] === (this.value as PinnedItemDTO);
        },
      );
      let foundIndex = START;
      let lastType: string;
      entries.some(({ entry, type }) => {
        if (lastType && lastType !== type) {
          foundIndex++;
        }
        lastType = type;
        if (entry[VALUE] === value?.entry[VALUE]) {
          return true;
        }
        foundIndex++;
        return false;
      });
      this.selectedLine = foundIndex;
    }
    const events = observe(this.rl);
    events.keypress.forEach(this.onKeypress.bind(this));
    events.line.forEach(this.onEnd.bind(this));

    cliCursor.hide();
    this.render();
    return this;
  }

  private getHelp(): string {
    return [
      chalk`  {cyan - } {bold (p)} {dim Show pinned items}`,
      chalk`  {cyan - } {bold (m)} {dim Show regular menu (default view)}`,
    ].join(`\n`);
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
      const separator = index > a.length - ARRAY_OFFSET ? '' : chalk.cyan('|');
      out[index] = chalk`${current}${separator} ${item}`;
    });
    return out;
  }

  private onDownKey(): void {
    const list = this.entries;
    if (this.selectedLine === list.length - ARRAY_OFFSET) {
      this.selectedLine = START;
      return;
    }
    this.selectedLine++;
    if (list[this.selectedLine] === EMPTY_TEXT) {
      this.selectedLine++;
    }
  }

  private onEnd(): void {
    this.status = 'answered';
    this.render();
    this.screen.done();
    cliCursor.show();
    this.done(this.value);
  }

  private onKeypress({ key }: KeyDescriptor): void {
    if (key.ctrl || key.shift || key.meta || this.status === 'answered') {
      return;
    }
    const mixed = key.name ?? key.sequence;
    switch (mixed) {
      case 'left':
        if (IsEmpty(this.opt.pinned)) {
          return;
        }
        this.selectedType = 'pinned';
        this.sanityCheck();
        break;
      case 'right':
        this.selectedType = 'menu';
        this.sanityCheck();
        break;
      case 'up':
        this.onUpKey();
        break;
      case 'down':
        this.onDownKey();
        break;
    }
    this.render();
  }

  private onUpKey(): void {
    const list = this.entries;

    if (this.selectedLine === START) {
      this.selectedLine = list.length - ARRAY_OFFSET;
      return;
    }
    this.selectedLine--;
    if (list[this.selectedLine] === EMPTY_TEXT) {
      this.selectedLine--;
    }
  }

  private render(): void {
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }

    let message = '';
    const out = this.mergeLines(this.renderPinned(), this.renderMenu());

    message += out.map((i) => `  ${i}`).join(`\n`);
    if (this.firstRender) {
      // message += chalk`\n{cyan   - }{dim Use arrow / number keys}`;
      this.firstRender = false;
    }
    this.screen.render(message, '');
  }

  private renderMenu(): string[] {
    const out: string[] = [];
    const menu = this.menu;
    const maxCategory = Math.max(...menu.map(({ type }) => type.length));
    let last = '';
    menu.forEach((item) => {
      let prefix = TitleCase(item.type.padEnd(maxCategory, ' '));
      if (last === prefix) {
        prefix = ''.padEnd(maxCategory, ' ');
      } else {
        if (last !== '') {
          out.push(EMPTY_TEXT);
        }
        last = prefix;
        prefix = `${prefix}`;
      }
      const inverse = out.length === this.selectedLine;
      if (inverse && this.selectedType === 'menu') {
        this.value = item.entry[VALUE];
      }
      out.push(
        this.selectedType === 'menu'
          ? chalk`{magenta ${prefix}} {${inverse ? 'cyan.inverse' : 'white'}  ${
              item.entry[LABEL]
            } }`
          : chalk`{gray ${prefix}  ${item.entry[LABEL]} }`,
      );
    });
    return out;
  }

  private renderPinned(): string[] {
    const out: string[] = [];
    const pinned = this.pinned;
    const maxType = Math.max(...pinned.map(({ type }) => type.length));
    let last = '';
    pinned.forEach((item) => {
      let prefix = TitleCase(item.type.padEnd(maxType, ' '));
      if (last === prefix) {
        prefix = ''.padEnd(maxType, ' ');
      } else {
        if (last !== '') {
          out.push(EMPTY_TEXT);
        }
        last = prefix;
        prefix = `${prefix}`;
      }
      const inverse = out.length === this.selectedLine;
      if (inverse && this.selectedType === 'pinned') {
        this.value = item.entry[VALUE];
      }
      out.push(
        this.selectedType === 'pinned'
          ? chalk`{magenta ${prefix}} {${inverse ? 'cyan.inverse' : 'white'} ${
              item.entry[LABEL]
            }} `
          : chalk`{gray ${prefix} ${item.entry[LABEL]}} `,
      );
    });
    return out;
  }

  private sanityCheck(): void {
    const list =
      this.selectedType === 'menu' ? this.renderMenu() : this.renderPinned();
    if (list.length - ARRAY_OFFSET < this.selectedLine) {
      this.selectedLine = list.length - ARRAY_OFFSET;
    }
    if (list[this.selectedLine] === EMPTY_TEXT) {
      this.selectedLine--;
    }
  }
}
