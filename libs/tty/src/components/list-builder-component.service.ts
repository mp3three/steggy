import { forwardRef, Inject } from '@nestjs/common';
import {
  ARRAY_OFFSET,
  DOWN,
  FIRST,
  INCREMENT,
  INVERT_VALUE,
  is,
  LABEL,
  NOT_FOUND,
  SINGLE,
  sleep,
  START,
  UP,
} from '@steggy/utilities';
import chalk from 'chalk';

import { GV, MenuEntry, tKeyMap, TTYKeypressOptions } from '../contracts';
import { Component, iComponent } from '../decorators';
import { ansiMaxLength, ansiPadEnd } from '../includes';
import {
  KeyboardManagerService,
  KeymapService,
  ScreenService,
  TextRenderingService,
} from '../services';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

export interface ListBuilderOptions<T = unknown> {
  current?: MenuEntry<T | string>[];
  items?: string;
  source: MenuEntry<T | string>[];
}

const KEYMAP_FIND: tKeyMap = new Map<TTYKeypressOptions, string>([
  [{ key: 'backspace', powerUser: true }, 'searchBack'],
  [{ description: 'toggle selected', key: ['`', 'f4'] }, 'toggle'],
  [{ description: 'current', key: 'left' }, 'onLeft'],
  [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
  [{ description: 'available', key: 'right' }, 'onRight'],
  [{ powerUser: true }, 'searchAppend'],
  [
    {
      description: 'navigate',
      key: ['up', 'down', 'home', 'pageup', 'end', 'pagedown'],
    },
    'navigateSearch',
  ],
]);
const KEYMAP_NORMAL: tKeyMap = new Map([
  [{ key: 'i' }, 'invert'],
  [{ description: 'select all', key: ['[', 'a'] }, 'selectAll'],
  [{ description: 'select none', key: [']', 'n'] }, 'selectNone'],
  [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
  [{ description: 'toggle selected', key: ['`', 'f4', 'space'] }, 'toggle'],
  [{ key: 'f12' }, 'reset'],
  [{ key: 'c' }, 'cancel'],
  [{ description: 'done', key: 'd' }, 'onEnd'],
  [{ description: 'left', key: 'left' }, 'onLeft'],
  [{ description: 'right', key: 'right' }, 'onRight'],
  [{ key: ['home', 'pageup'] }, 'top'],
  [{ key: ['end', 'pagedown'] }, 'bottom'],
  [{ key: 'up' }, 'previous'],
  [{ key: 'down' }, 'next'],
  [{ key: [...'0123456789'], powerUser: true }, 'numericSelect'],
]);

@Component({ type: 'list' })
export class ListBuilderComponentService<VALUE = unknown>
  implements iComponent<ListBuilderOptions<VALUE>, VALUE>
{
  constructor(
    @Inject(forwardRef(() => KeymapService))
    private readonly keymap: KeymapService,
    @Inject(forwardRef(() => TextRenderingService))
    private readonly textRender: TextRenderingService,
    private readonly screen: ScreenService,
    private readonly keyboard: KeyboardManagerService,
  ) {}
  private complete = false;
  private current: MenuEntry<VALUE | string>[];

  private done: (type: VALUE[]) => void;
  private final = false;
  private mode: 'find' | 'select' = 'select';
  private numericSelection = '';
  private opt: ListBuilderOptions<VALUE>;
  private searchText = '';
  private selectedType: 'current' | 'source' = 'source';
  private source: MenuEntry<VALUE | string>[];
  private value: VALUE;

  public configure(
    options: ListBuilderOptions<VALUE>,
    done: (type: VALUE[]) => void,
  ): void {
    this.complete = false;
    this.final = false;
    this.done = done;
    this.opt = options;
    this.opt.source ??= [];
    this.opt.current ??= [];
    this.current = [...this.opt.current];
    this.source = [...this.opt.source];
    this.opt.items ??= `Items`;
    this.value ??= (
      is.empty(this.source) ? GV(this.current[START]) : GV(this.source[START])
    ) as VALUE;
    this.detectSide();
    this.keyboard.setKeyMap(this, KEYMAP_NORMAL);
  }

  public render(updateValue = false): void {
    if (this.complete) {
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
    if (this.final) {
      this.screen.render(chalk.blue('='.repeat(ansiMaxLength(message))));
      this.final = false;
      this.complete = true;
      return;
    }
    this.screen.render(
      message.join(`\n`),
      this.keymap.keymapHelp({ message: message.join(`\n`) }),
    );
  }

  protected add(): void {
    if (this.selectedType === 'current') {
      return;
    }
    // retrieve source list (prior to removal)
    const source = this.side('source', false);

    // Move item to current list
    const item = this.source.find(
      item => GV(item) === this.value,
    ) as MenuEntry<string>;
    this.current.push(item);
    // Remove from source
    this.source = this.source.filter(check => GV(check) !== this.value);

    // Find move item in original source list
    const index = source.findIndex(i => GV(i) === this.value);

    // If at bottom, move up one
    if (index === source.length - ARRAY_OFFSET) {
      // If only item, flip sides
      if (index === START) {
        this.selectedType = 'current';
        return;
      }
      this.value = GV(source[index - INCREMENT]);
      return;
    }
    // If not bottom, move down one
    this.value = GV(source[index + INCREMENT]);
  }

  protected bottom(): void {
    const list = this.side();
    this.value = GV(list[list.length - ARRAY_OFFSET]);
  }

  protected cancel(): void {
    this.reset();
    this.onEnd();
  }

  protected invert(): void {
    const temporary = this.source;
    this.source = this.current;
    this.current = temporary;
    this.detectSide();
  }

  protected navigateSearch(key: string): void {
    const all = this.side();
    let available = this.filterMenu(all);
    if (is.empty(available)) {
      available = all;
    }
    if (['pageup', 'home'].includes(key)) {
      this.value = GV(available[START]);
      return this.render();
    }
    if (['pagedown', 'end'].includes(key)) {
      this.value = GV(available[available.length - ARRAY_OFFSET]);
      return this.render();
    }
    const index = available.findIndex(entry => GV(entry) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(available[START]);
      return this.render();
    }
    if (index === START && key === 'up') {
      this.value = GV(available[available.length - ARRAY_OFFSET]);
    } else if (index === available.length - ARRAY_OFFSET && key === 'down') {
      this.value = GV(available[START]);
    } else {
      this.value = GV(
        available[key === 'up' ? index - INCREMENT : index + INCREMENT],
      );
    }
  }

  protected next(): void {
    const list = this.side();
    const index = list.findIndex(i => GV(i) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(list[FIRST]);
      return;
    }
    if (index === list.length - ARRAY_OFFSET) {
      // Loop around
      this.value = GV(list[FIRST]);
      return;
    }
    this.value = GV(list[index + INCREMENT]);
  }

  protected numericSelect(mixed: string): void {
    this.numericSelection = mixed;
    const item =
      this.side()[
        Number(is.empty(this.numericSelection) ? '1' : this.numericSelection) -
          ARRAY_OFFSET
      ];
    this.value = is.object(item) ? GV(item) : this.value;
  }

  protected async onEnd(): Promise<void> {
    this.mode = 'select';
    this.final = true;
    this.render();
    await sleep();
    this.done(this.current.map(i => GV(i) as VALUE));
  }

  protected onLeft(): void {
    const [left, right] = [
      this.side('current', true),
      this.side('source', true),
    ];
    if (is.empty(left) || this.selectedType === 'current') {
      return;
    }
    this.selectedType = 'current';
    let current = right.findIndex(i => GV(i) === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > left.length) {
      current = left.length - ARRAY_OFFSET;
    }
    this.value =
      left.length < current
        ? GV(left[left.length - ARRAY_OFFSET])
        : GV(left[current]);
  }

  protected onRight(): void {
    const [right, left] = [
      this.side('source', true),
      this.side('current', true),
    ];
    if (this.selectedType === 'source' || is.empty(right)) {
      return;
    }
    this.selectedType = 'source';
    let current = left.findIndex(i => GV(i) === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > right.length) {
      current = right.length - ARRAY_OFFSET;
    }
    this.value =
      right.length - ARRAY_OFFSET < current
        ? GV(right[right.length - ARRAY_OFFSET])
        : GV(right[current]);
  }

  protected previous(): void {
    const list = this.side();
    const index = list.findIndex(i => GV(i) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(list[FIRST]);
      return;
    }
    if (index === FIRST) {
      // Loop around
      this.value = GV(list[list.length - ARRAY_OFFSET]);
      return;
    }
    this.value = GV(list[index - INCREMENT]);
  }

  protected reset(): void {
    this.current = [...this.opt.current];
    this.source = [...this.opt.source];
  }

  protected searchAppend(key: string): boolean {
    if ((key.length > SINGLE && key !== 'space') || ['`'].includes(key)) {
      return false;
    }
    this.searchText += key === 'space' ? ' ' : key;
    if (is.empty(this.side())) {
      this.selectedType = this.selectedType === 'source' ? 'current' : 'source';
    }
    this.render(true);
    return false;
  }

  protected searchBack(): boolean {
    this.searchText = this.searchText.slice(START, ARRAY_OFFSET * INVERT_VALUE);
    this.render(true);
    return false;
  }

  protected selectAll(): void {
    this.current = [...this.current, ...this.source];
    this.source = [];
    this.detectSide();
  }

  protected selectNone(): void {
    this.source = [...this.current, ...this.source];
    this.current = [];
    this.detectSide();
  }

  protected toggle(): void {
    if (this.selectedType === 'current') {
      this.remove();
      return;
    }
    this.add();
  }

  protected toggleFind(): void {
    this.mode = this.mode === 'find' ? 'select' : 'find';
    this.searchText = '';
    this.keyboard.setKeyMap(
      this,
      this.mode === 'find' ? KEYMAP_FIND : KEYMAP_NORMAL,
    );
  }

  protected top(): void {
    const list = this.side();
    this.value = GV(list[FIRST]);
  }

  private detectSide(): void {
    const isLeftSide = this.side('current').some(i => GV(i) === this.value);
    this.selectedType = isLeftSide ? 'current' : 'source';
  }

  private filterMenu(
    data: MenuEntry<VALUE>[],
    updateValue = false,
  ): MenuEntry<VALUE>[] {
    const highlighted = this.textRender.fuzzySort(this.searchText, data);
    if (is.empty(highlighted) || updateValue === false) {
      return highlighted;
    }
    this.value = GV(highlighted[START]);
    return highlighted;
  }

  private remove(): void {
    if (this.selectedType === 'source') {
      return;
    }
    // retrieve current list (prior to removal)
    const current = this.side('current', false);

    // Move item to current list
    const item = this.current.find(
      item => GV(item) === this.value,
    ) as MenuEntry<string>;
    this.source.push(item);
    // Remove from source
    this.current = this.current.filter(check => GV(check) !== this.value);

    // Find move item in original source list
    const index = current.findIndex(i => GV(i) === this.value);

    // If at bottom, move up one
    if (index === current.length - ARRAY_OFFSET) {
      // If only item, flip sides
      if (index === START) {
        this.selectedType = 'current';
        return;
      }
      this.value = GV(current[index - INCREMENT]);
      return;
    }
    // If not bottom, move down one
    this.value = GV(current[index + INCREMENT]);
  }

  private renderSide(
    side: 'current' | 'source' = this.selectedType,
    updateValue = false,
  ): string[] {
    const out: string[] = [];
    let menu = this.side(side, true);
    if (this.mode === 'find' && !is.empty(this.searchText)) {
      menu = this.filterMenu(menu, updateValue);
    }
    const maxLabel =
      ansiMaxLength(...menu.map(entry => entry[LABEL])) + ARRAY_OFFSET;
    if (is.empty(menu)) {
      out.push(chalk.bold` {gray.inverse  List is empty } `);
    }
    menu.forEach(item => {
      const inverse = GV(item) === this.value;
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

  private side(
    side: 'current' | 'source' = this.selectedType,
    range = false,
  ): MenuEntry<VALUE>[] {
    if (range) {
      return this.textRender.selectRange(this.side(side, false), this.value);
    }
    if (this.mode === 'find') {
      return this.textRender.fuzzySort<VALUE>(
        this.searchText,
        this[side] as MenuEntry<VALUE>[],
      );
    }
    return this[side].sort((a, b) => {
      return a[LABEL].replace(UNSORTABLE, '') > b[LABEL].replace(UNSORTABLE, '')
        ? UP
        : DOWN;
    }) as MenuEntry<VALUE>[];
  }
}
