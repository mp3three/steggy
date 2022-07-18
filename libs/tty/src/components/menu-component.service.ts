import { forwardRef, Inject } from '@nestjs/common';
import {
  ARRAY_OFFSET,
  FIRST,
  INCREMENT,
  INVERT_VALUE,
  is,
  LABEL,
  NOT_FOUND,
  PAIR,
  SINGLE,
  START,
  TitleCase,
  VALUE,
} from '@steggy/utilities';
import chalk from 'chalk';
import dayjs from 'dayjs';

import {
  DirectCB,
  GV,
  MainMenuEntry,
  MenuEntry,
  tKeyMap,
  TTYKeypressOptions,
} from '../contracts';
import { Component, iComponent } from '../decorators';
import { ansiMaxLength, ansiPadEnd } from '../includes';
import {
  KeyboardManagerService,
  KeymapService,
  PromptEntry,
  ScreenService,
  TextRenderingService,
} from '../services';

type tMenuItem = [TTYKeypressOptions, string | DirectCB];

export function ToMenuEntry<T>(entries: PromptEntry<T>[]): MainMenuEntry<T>[] {
  return entries.map(entry => ({ entry } as MainMenuEntry<T>));
}
export type KeyMap<VALUE = string> = Record<string, PromptEntry<VALUE>>;

/**
 * - true to terminate menu
 * - false to silently block
 * - string to block w/ output
 */
export type MainMenuCB<T = unknown> = (
  action: string,
  /**
   * The currently selected value
   */
  value: MenuEntry<T>,
) => (string | boolean) | Promise<string | boolean>;

export interface MenuComponentOptions<T = unknown> {
  /**
   * Remove the page up / page down keypress options
   *
   * Doing this is mostly for UI aesthetics, removing a bit of extra help text for smaller menus.
   * Implies `hideSearch`
   */
  condensed?: boolean;
  /**
   * Static text to stick at the top of the component.
   *
   * If passed as array, each item is it's own line
   */
  headerMessage?: string | [string, string][];
  /**
   * Extra padding to shift the header over by
   */
  headerPadding?: number;
  /**
   * Disallow usage of fuzzy search
   */
  hideSearch?: boolean;
  item?: string;
  /**
   * Entries to activate via keybindings instead of navigation
   */
  keyMap?: KeyMap<T>;
  /**
   * When provided, all keymap commands will be passed through this first.
   *
   * - `return true` to use default handler logic
   * - `return string` to report back a status message to the user (for background operations)
   */
  keyMapCallback?: MainMenuCB;
  /**
   * Set to true if deliberately using the menu as a keyboard navigation tool only.
   * Hides keyboard navigation help entries, and warning related to no entries provided
   */
  keyOnly?: boolean;
  /**
   * Entries to place in the left column.
   * If only using one column, right / left doesn't matter
   */
  left?: MainMenuEntry<T | string>[];
  /**
   * Header to be placed directly above the menu entries in the left column
   */
  leftHeader?: string;
  /**
   * Entries to place in the right column.
   * If only using one column, right / left doesn't matter
   */
  right?: MainMenuEntry<T | string>[];
  /**
   * Header to be placed directly above the menu entries in the right column
   */
  rightHeader?: string;
  /**
   * Show menu entries without the column headers
   */
  showHeaders?: boolean;
  /**
   * Append the help text below menu
   */
  showHelp?: boolean;
  //
  // /**
  //  * Automatically sort menu entries alphabetically by label
  //  */
  // sort?: boolean;
  /**
   * Make menu entry group types prettier.
   *
   * Ex: "some-property" => "Some Property"
   */
  titleTypes?: boolean;
  /**
   * Default selected entry. Can be in either left or right list
   */
  value?: T;
}

const DEFAULT_HEADER_PADDING = 4;
const EMPTY_TEXT = ' ';

const SEARCH_KEYMAP: tKeyMap = new Map([
  [{ catchAll: true, powerUser: true }, 'onSearchKeyPress'],
  [{ description: 'next', key: 'down' }, 'navigateSearch'],
  [{ description: 'previous', key: 'up' }, 'navigateSearch'],
  [{ description: 'bottom', key: ['end', 'pagedown'] }, 'navigateSearch'],
  [{ description: 'top', key: ['home', 'pageup'] }, 'navigateSearch'],
  [{ description: 'select entry', key: 'enter' }, 'onEnd'],
  [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
]);

@Component({ type: 'menu' })
export class MenuComponentService<VALUE = unknown | string>
  implements iComponent<MenuComponentOptions, VALUE>
{
  constructor(
    @Inject(forwardRef(() => KeymapService))
    private readonly keymap: KeymapService,
    @Inject(forwardRef(() => TextRenderingService))
    private readonly textRender: TextRenderingService,
    private readonly keyboardService: KeyboardManagerService,
    private readonly screen: ScreenService,
  ) {}

  private callbackOutput = '';
  private callbackTimestamp = dayjs();
  private complete = false;
  private done: (type: VALUE) => void;
  private final = false;
  private headerPadding: number;
  private leftHeader: string;
  private mode: 'find' | 'select' = 'select';
  private opt: MenuComponentOptions<VALUE>;
  private rightHeader: string;
  private searchText = '';
  private selectedType: 'left' | 'right' = 'right';
  private value: VALUE;

  public configure(
    config: MenuComponentOptions<VALUE>,
    done: (type: VALUE) => void,
  ): void {
    this.opt = config;
    this.complete = false;
    this.final = false;
    // this.showHelp = this.opt.showHelp ?? true;
    this.opt.left ??= [];
    this.opt.item ??= 'actions';
    this.opt.right ??= [];
    this.opt.showHeaders ??= !is.empty(this.opt.left);
    this.opt.left.forEach(i => (i.type ??= ''));
    this.opt.right.forEach(i => (i.type ??= ''));
    this.opt.keyMap ??= {};
    // This shouldn't need casting...
    this.value = this.opt.value as VALUE;
    this.headerPadding = this.opt.headerPadding ?? DEFAULT_HEADER_PADDING;
    this.rightHeader = this.opt.rightHeader || 'Menu';
    this.leftHeader =
      this.opt.leftHeader ||
      (!is.empty(this.opt.left) && !is.empty(this.opt.right)
        ? 'Secondary'
        : 'Menu');

    const defaultValue = GV(this.side('right')[START]?.entry);
    this.value ??= defaultValue;
    this.detectSide();
    this.done = done;
    this.setKeymap();
    const contained = this.side().find(i => GV(i.entry) === this.value);
    if (!contained) {
      this.value = defaultValue;
    }
  }

  /**
   * Entrypoint for rendering logic
   */
  public render(updateValue = false): void {
    // Complete = this widget must have `configure()` called prior to doing more rendering
    if (this.complete) {
      return;
    }
    // Final = this widget has returned a value,
    //   and wants to clean up the UI a bit before finishing
    if (this.final) {
      this.final = false;
      this.complete = true;
      return this.renderFinal();
    }
    // VVVVV Normal rendering work VVVVV
    if (this.mode === 'select') {
      return this.renderSelect();
    }
    this.renderFind(updateValue);
  }

  /**
   * Run callbacks from the keyMap
   */
  protected async activateKeyMap(mixed: string): Promise<boolean> {
    const { keyMap, keyMapCallback: callback } = this.opt;
    if (is.undefined(keyMap[mixed])) {
      return false;
    }
    if (is.undefined(callback)) {
      this.value = GV(keyMap[mixed]);
      this.onEnd();
      return false;
    }
    const selectedItem = this.side().find(
      ({ entry }) => GV(entry) === this.value,
    );
    const result = await callback(
      GV(keyMap[mixed]) as unknown as string,
      selectedItem?.entry,
    );
    if (is.string(result)) {
      this.callbackOutput = result;
      this.callbackTimestamp = dayjs();
      return;
    }
    if (result) {
      this.value = GV(keyMap[mixed]);
      this.onEnd();
      return false;
    }
  }

  /**
   * Move the cursor to the bottom of the list
   */
  protected bottom(): void {
    const list = this.side();
    this.value = GV(list[list.length - ARRAY_OFFSET].entry);
  }

  /**
   * Move the cursor around
   */
  protected navigateSearch(key: string): void {
    const all = this.side();
    let available = this.filterMenu(all);
    if (is.empty(available)) {
      available = all;
    }
    if (['pageup', 'home'].includes(key)) {
      this.value = GV(available[START].entry);
      return;
    }
    if (['pagedown', 'end'].includes(key)) {
      this.value = GV(available[available.length - ARRAY_OFFSET].entry);
      return;
    }
    const index = available.findIndex(({ entry }) => GV(entry) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(available[START].entry);
      return;
    }
    if (index === START && key === 'up') {
      this.value = GV(available[available.length - ARRAY_OFFSET].entry);
    } else if (index === available.length - ARRAY_OFFSET && key === 'down') {
      this.value = GV(available[START].entry);
    } else {
      this.value = GV(
        available[key === 'up' ? index - INCREMENT : index + INCREMENT].entry,
      );
    }
  }

  /**
   * Move down 1 entry
   */
  protected next(): void {
    const list = this.side();
    const index = list.findIndex(i => GV(i.entry) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(list[FIRST].entry);
      return;
    }
    if (index === list.length - ARRAY_OFFSET) {
      // Loop around
      this.value = GV(list[FIRST].entry);
      return;
    }
    this.value = GV(list[index + INCREMENT].entry);
  }

  protected numberSelect(mixed: string): boolean {
    const list = this.side();
    const item = list[Number(is.empty(mixed) ? '1' : mixed) - ARRAY_OFFSET];
    const entry = item?.entry;
    this.value = entry ? GV(entry) : this.value;
    return true;
  }

  /**
   * Terminate the editor
   */
  protected onEnd(): boolean {
    this.final = true;
    this.mode = 'select';
    this.callbackOutput = '';
    this.done(this.value);
    this.render();
    return false;
  }

  /**
   * on left key press - attempt to move to left menu
   */
  protected onLeft(): void {
    const [right, left] = [this.side('right'), this.side('left')];
    if (is.empty(this.opt.left) || this.selectedType === 'left') {
      return;
    }
    this.selectedType = 'left';
    let current = right.findIndex(i => GV(i.entry) === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > left.length) {
      current = left.length - ARRAY_OFFSET;
    }
    this.value =
      left.length - ARRAY_OFFSET < current
        ? GV(left[left.length - ARRAY_OFFSET].entry)
        : GV(left[current].entry);
  }

  /**
   * On right key press - attempt to move editor to right side
   */
  protected onRight(): void {
    if (this.selectedType === 'right') {
      return;
    }
    const [right, left] = [this.side('right'), this.side('left')];
    this.selectedType = 'right';
    let current = left.findIndex(i => GV(i.entry) === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > right.length) {
      current = right.length - ARRAY_OFFSET;
    }
    this.value =
      right.length - ARRAY_OFFSET < current
        ? GV(right[right.length - ARRAY_OFFSET].entry)
        : GV(right[current].entry);
  }

  /**
   * Key handler for widget while in search mode
   */
  protected onSearchKeyPress(key: string): boolean {
    if (key === 'backspace') {
      this.searchText = this.searchText.slice(
        START,
        ARRAY_OFFSET * INVERT_VALUE,
      );
      this.render(true);
      return false;
    }
    if (['up', 'down', 'home', 'pageup', 'end', 'pagedown'].includes(key)) {
      this.navigateSearch(key);
    }
    if (key === 'space') {
      this.searchText += ' ';
      this.render(true);
      return false;
    }
    if (key.length > SINGLE) {
      if (!is.undefined(this.opt.keyMap[key])) {
        this.value = GV(this.opt.keyMap[key]);
        this.onEnd();
      }
      return;
    }
    this.searchText += key;
    this.render(true);
    return false;
  }

  /**
   * Attempt to move up 1 item in the active list
   */
  protected previous(): void {
    const list = this.side();
    const index = list.findIndex(i => GV(i.entry) === this.value);
    if (index === NOT_FOUND) {
      this.value = GV(list[FIRST].entry);
      return;
    }
    if (index === FIRST) {
      // Loop around
      this.value = GV(list[list.length - ARRAY_OFFSET].entry);
      return;
    }
    this.value = GV(list[index - INCREMENT].entry);
  }

  /**
   * Simple toggle function
   */
  protected toggleFind(): void {
    this.mode = this.mode === 'find' ? 'select' : 'find';
    if (this.mode === 'select') {
      this.detectSide();
      this.setKeymap();
    } else {
      this.searchText = '';
      this.keyboardService.setKeyMap(this, SEARCH_KEYMAP);
    }
  }

  /**
   * Move cursor to the top of the current list
   */
  protected top(): void {
    const list = this.side();
    this.value = GV(list[FIRST].entry);
  }

  /**
   * Auto detect selectedType based on the current value
   */
  private detectSide(): void {
    const isLeftSide = this.side('left').some(i => GV(i.entry) === this.value);
    this.selectedType = isLeftSide ? 'left' : 'right';
  }

  /**
   * Search mode - limit results based on the search text
   */
  private filterMenu(
    data: MainMenuEntry<VALUE>[],
    updateValue = false,
  ): MainMenuEntry<VALUE>[] {
    const highlighted = this.textRender
      .fuzzySort(
        this.searchText,
        data.map(({ entry }) => entry) as MenuEntry<VALUE>[],
      )
      .map(i => {
        const item = data.find(({ entry }) => GV(entry) === GV(i));
        return {
          ...item,
          entry: i,
        };
      });
    if (updateValue) {
      this.value = is.empty(highlighted)
        ? undefined
        : GV(highlighted[START].entry);
    }
    return highlighted;
  }

  /**
   * Retrieve the currently selected menu entry
   */
  private getSelected(): MainMenuEntry {
    const list = [
      ...this.opt.left,
      ...this.opt.right,
      ...Object.values(this.opt.keyMap).map(
        entry => ({ entry } as MainMenuEntry),
      ),
    ];
    const out = list.find(i => GV(i.entry) === this.value);
    return out ?? list[START];
  }

  private renderFinal() {
    const item = this.selectedEntry();
    let message = '';
    if (!is.empty(item?.helpText)) {
      message += chalk`{blue.dim ?} ${item.helpText
        .split(`\n`)
        .map(line => line.replace(new RegExp('^ -'), chalk.cyan('   -')))
        .join(`\n`)}\n`;
    }
    message += chalk` {cyan >} `;
    if (!is.empty(item?.icon)) {
      message += `${item.icon} `;
    }
    if (!is.empty(item?.type)) {
      message += chalk`{magenta.bold [${item.type}]} `;
    }

    message += chalk.blue`${item?.entry[LABEL]}`;
    this.screen.render(message);
  }

  /**
   * Rendering for search mode
   */
  private renderFind(updateValue = false): void {
    let message = [
      ...this.textRender.searchBox(this.searchText),
      ...this.renderSide(undefined, false, updateValue),
    ].join(`\n`);
    const selectedItem = this.getSelected();
    if (!is.empty(selectedItem?.helpText)) {
      message += chalk`\n \n {blue.dim ?} ${selectedItem.helpText
        .split(`\n`)
        .map(line => line.replace(new RegExp('^ -'), chalk.cyan('   -')))
        .join(`\n`)}`;
    }
    this.screen.render(message, this.keymap.keymapHelp({ message }));
  }

  /**
   * Rendering for while not in find mode
   */
  private renderSelect(extraContent?: string) {
    let message = '';

    if (
      !is.empty(this.callbackOutput) &&
      this.callbackTimestamp.isAfter(dayjs().subtract(PAIR, 'second'))
    ) {
      message += this.callbackOutput + `\n\n`;
    }
    if (!is.empty(this.opt.headerMessage)) {
      let headerMessage = this.opt.headerMessage;
      if (Array.isArray(headerMessage)) {
        const max =
          ansiMaxLength(headerMessage.map(([label]) => label)) + INCREMENT;
        headerMessage = headerMessage
          .map(
            ([label, value]) =>
              chalk`{bold ${ansiPadEnd(label + ':', max)}} ${value}`,
          )
          .join(`\n`);
      }
      // const headerMessage = is.string(this.opt.headerMessage)
      //   ? this.opt.headerMessage
      //   : this.opt.headerMessage.map(([label,value]) => chalk``).join(`\n`);
      message += headerMessage + `\n\n`;
    }
    const out = !is.empty(this.opt.left)
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
    message += out.map(i => `  ${i}`).join(`\n`);
    const selectedItem = this.side().find(
      ({ entry }) => GV(entry) === this.value,
    );
    if (!is.empty(selectedItem?.helpText)) {
      message += chalk`\n \n {blue.dim ?} ${selectedItem.helpText
        .split(`\n`)
        .map(line => line.replace(new RegExp('^ -'), chalk.cyan('   -')))
        .join(`\n`)}`;
    }
    this.screen.render(
      message,
      !is.empty(extraContent)
        ? extraContent
        : this.keymap.keymapHelp({
            message,
            prefix: new Map(
              Object.entries(this.opt.keyMap).map(([description, item]) => {
                if (!Array.isArray(item)) {
                  return;
                }
                const [label] = item;
                return [
                  { description: (label + '  ') as string, key: description },
                  '',
                ];
              }),
            ),
          }),
    );
  }

  /**
   * Render a menu from a side
   */
  // eslint-disable-next-line radar/cognitive-complexity
  private renderSide(
    side: 'left' | 'right' = this.selectedType,
    header = this.opt.showHeaders,
    updateValue = false,
  ): string[] {
    const out: string[] = [''];
    let menu = this.side(side);
    if (this.mode === 'find' && !is.empty(this.searchText)) {
      menu = this.filterMenu(menu, updateValue);
    }
    const temporary = this.textRender.selectRange(
      menu.map(({ entry }) => entry),
      this.value,
    );
    menu = temporary.map(i => menu.find(({ entry }) => GV(i) === GV(entry)));

    const maxType = ansiMaxLength(...menu.map(({ type }) => type));
    let last = '';
    const maxLabel =
      ansiMaxLength(
        ...menu.map(
          ({ entry, icon }) =>
            entry[LABEL] + (is.empty(icon) ? '' : `${icon} `),
        ),
      ) + ARRAY_OFFSET;
    if (is.empty(menu) && !this.opt.keyOnly) {
      out.push(
        chalk.bold` {yellowBright.inverse  No ${this.opt.item} to select from }`,
      );
    }
    menu.forEach(item => {
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
      const inverse = GV(item.entry) === this.value;
      const padded = ansiPadEnd(
        (is.empty(item.icon) ? '' : `${item.icon} `) + item.entry[LABEL],
        maxLabel,
      );
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
    const max = ansiMaxLength(...out);
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

  private selectedEntry(): MainMenuEntry {
    return [
      ...this.side('right'),
      ...this.side('left'),
      ...Object.values(this.opt.keyMap).map((entry: MenuEntry<VALUE>) => ({
        entry,
      })),
    ].find(item => GV(item.entry) === this.value);
  }

  private setKeymap(): void {
    const PARTIAL_LIST: tMenuItem[] = [
      [{ catchAll: true, powerUser: true }, 'activateKeyMap'],
      ...(this.opt.keyOnly
        ? []
        : ([
            [{ key: 'down' }, 'next'],
            [{ description: 'select entry', key: 'enter' }, 'onEnd'],
            [{ key: 'up' }, 'previous'],
            [
              {
                description: 'select item',
                key: [...'0123456789'],
                powerUser: true,
              },
              'numberSelect',
            ],
          ] as tMenuItem[])),
      ...((this.opt.condensed || this.opt.keyOnly
        ? []
        : [
            [{ key: ['end', 'pagedown'] }, 'bottom'],
            [{ key: ['home', 'pageup'] }, 'top'],
          ]) as tMenuItem[]),
    ];
    const LEFT_RIGHT: tMenuItem[] = [
      [{ description: 'left', key: 'left' }, 'onLeft'],
      [{ description: 'right', key: 'right' }, 'onRight'],
    ];
    const SEARCH: tMenuItem[] = [
      [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
    ];

    const keymap = new Map([
      ...PARTIAL_LIST,
      ...(is.empty(this.opt.left) || is.empty(this.opt.right)
        ? []
        : LEFT_RIGHT),
      ...(this.opt.hideSearch || this.opt.keyOnly ? [] : SEARCH),
    ]);
    this.keyboardService.setKeyMap(this, keymap);
  }

  // this used to do more
  private side(
    side: 'left' | 'right' = this.selectedType,
    noRecurse = false,
  ): MainMenuEntry<VALUE>[] {
    if (this.mode === 'find' && !noRecurse) {
      return [...this.side('right', true), ...this.side('left', true)];
    }
    return this.opt[side] as MainMenuEntry<VALUE>[];
  }
}
