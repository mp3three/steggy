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
  START,
  UP,
  VALUE,
} from '@text-based/utilities';
import chalk from 'chalk';

import { ICONS, MenuEntry, tKeyMap } from '../../contracts';
import { Component, iComponent } from '../../decorators';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { TextRenderingService } from '../../services';
import { ApplicationManagerService } from '../application-manager.service';
import { ScreenService } from '../render';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

export interface ListBuilderOptions<T = unknown> {
  current?: MenuEntry<T | string>[];
  items?: string;
  source: MenuEntry<T | string>[];
}

const BASE_HELP = [
  ['arrows', 'move cursor'],
  ['enter', 'select entry'],
  ['home', 'move to top'],
  ['end', 'move to bottom'],
  ['tab', 'toggle find mode'],
] as MenuEntry[];

const MENU_HELP = [
  ['d', 'Done'],
  ['space,f4,`', 'Toggle'],
  ['i', 'Inverse'],
  ['[', `Select all`],
  [']', 'Remove all'],
  ['f12', 'Reset'],
  ['c', 'Cancel'],
] as MenuEntry[];

const SEARCH_HELP = [['f4,`', 'Toggle entry']] as MenuEntry[];

const KEYMAP_FIND: tKeyMap = new Map([
  [{ key: 'backspace' }, 'searchBack'],
  [{ key: ['f4', '`'] }, 'toggle'],
  [{ key: 'left' }, 'onLeft'],
  [{ key: 'tab' }, 'toggleFind'],
  [{ key: 'right' }, 'onRight'],
  [{}, 'searchAppend'],
  [
    { key: ['up', 'down', 'home', 'pageup', 'end', 'pagedown'] },
    'navigateSearch',
  ],
]);
const KEYMAP_NORMAL: tKeyMap = new Map([
  [{ key: 'i' }, 'invert'],
  [{ key: ['a', '['] }, 'selectAll'],
  [{ key: ']' }, 'selectNone'],
  [{ key: 'tab' }, 'toggleFind'],
  [{ key: ['space', 'f4', '`'] }, 'toggle'],
  [{ key: 'f12' }, 'reset'],
  [{ key: 'c' }, 'cancel'],
  [{ key: 'd' }, 'onEnd'],
  [{ key: 'left' }, 'onLeft'],
  [{ key: 'right' }, 'onRight'],
  [{ key: ['home', 'pageup'] }, 'top'],
  [{ key: ['end', 'pagedown'] }, 'bottom'],
  [{ key: 'up' }, 'previous'],
  [{ key: 'down' }, 'next'],
  [{ key: [...'0123456789'] }, 'numericSelect'],
]);

@Component({ type: 'list' })
export class ListBuilderComponentService<VALUE = unknown>
  implements iComponent<ListBuilderOptions<VALUE>, VALUE>
{
  constructor(
    @Inject(forwardRef(() => TextRenderingService))
    private readonly textRender: TextRenderingService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
  ) {}
  private current: MenuEntry<VALUE | string>[];

  private done: (type: VALUE[]) => void;
  private mode: 'find' | 'select' = 'select';
  private numericSelection = '';
  private opt: ListBuilderOptions<VALUE>;
  private searchText = '';
  private selectedType: 'current' | 'source' = 'source';
  private source: MenuEntry<VALUE | string>[];
  private value: VALUE;

  public configure(): void {
    this.opt.source ??= [];
    this.opt.current ??= [];
    this.current = [...this.opt.current];
    this.source = [...this.opt.source];
    this.opt.items ??= `Items`;
    this.value ??= (
      is.empty(this.source)
        ? this.current[START][VALUE]
        : this.source[START][VALUE]
    ) as VALUE;
    this.detectSide();
    this.applicationManager.setKeyMap(this, KEYMAP_NORMAL);
  }

  protected add(): void {
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

  protected bottom(): void {
    const list = this.side();
    this.value = list[list.length - ARRAY_OFFSET][VALUE];
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
  }

  protected next(): void {
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

  protected numericSelect(mixed: string): void {
    this.numericSelection = mixed;
    this.value =
      this.side()[
        Number(is.empty(this.numericSelection) ? '1' : this.numericSelection) -
          ARRAY_OFFSET
      ][VALUE] ?? this.value;
  }

  protected onEnd(): void {
    this.done(this.current.map((i) => i[VALUE] as VALUE));
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

  protected onRight(): void {
    const [right, left] = [
      this.side('source', true),
      this.side('current', true),
    ];
    if (this.selectedType === 'source' || is.empty(right)) {
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

  protected previous(): void {
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

  protected render(updateValue = false): void {
    // if (this.status === 'answered') {
    //   if (is.empty(this.current)) {
    //     this.screenService.render(
    //       chalk` {magenta >} No ${this.opt.items} selected\n `,
    //       '',
    //     );
    //     return;
    //   }
    //   this.screenService.render(
    //     chalk` {magenta >} {yellow ${this.current.length}} ${this.opt.items} selected\n `,
    //     '',
    //   );
    //   return;
    // }
    // if (this.status === 'answered') {
    //   this.screenService.render(``, '');
    //   return;
    // }
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
    this.screenService.render(
      this.textRender.appendHelp(
        message.join(`\n`),
        BASE_HELP,
        this.mode === 'find' ? SEARCH_HELP : MENU_HELP,
      ),
      '',
    );
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
    this.applicationManager.setKeyMap(
      this,
      this.mode === 'find' ? KEYMAP_FIND : KEYMAP_NORMAL,
    );
  }

  protected top(): void {
    const list = this.side();
    this.value = list[FIRST][VALUE];
  }

  private detectSide(): void {
    const isLeftSide = this.side('current').some(
      (i) => i[VALUE] === this.value,
    );
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
    this.value = highlighted[START][VALUE];
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
      ansiMaxLength(menu.map((entry) => entry[LABEL])) + ARRAY_OFFSET;
    if (is.empty(menu)) {
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
