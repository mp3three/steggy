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
  TitleCase,
  UP,
  VALUE,
} from '@steggy/utilities';
import chalk from 'chalk';

import {
  DirectCB,
  InquirerKeypressOptions,
  MainMenuEntry,
  MenuEntry,
  tKeyMap,
} from '../../contracts';
import { Component, iComponent } from '../../decorators';
import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../../includes';
import { KeyboardManagerService, ScreenService } from '../meta';
import { PromptEntry } from '../prompt.service';
import { KeymapService, TextRenderingService } from '../render';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');
type tMenuItem = [InquirerKeypressOptions, string | DirectCB];

export function ToMenuEntry<T>(entries: PromptEntry<T>[]): MainMenuEntry<T>[] {
  const out: MainMenuEntry<T>[] = [];
  let header = '';
  entries.forEach(i => {
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
  condensed?: boolean;
  /**
   * Static text to stick at the top of the component
   */
  headerMessage?: string;
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
   * Only run against keyMap activations
   *
   * Passes in currently selected value
   */
  keyMapCallback?: MainMenuCB;
  /**
   * Don't freak out if menu entries are not provided.
   * Set to true if deliberately using the menu as a keyboard navigation tool only
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
  /**
   * Automatically sort menu entries alphabetically by label
   */
  sort?: boolean;
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
  [{ catchAll: true, noHelp: true }, 'onSearchKeyPress'],
  [{ description: 'next', key: 'down' }, 'navigateSearch'],
  [{ description: 'previous', key: 'up' }, 'navigateSearch'],
  [{ description: 'bottom', key: ['end', 'pagedown'] }, 'navigateSearch'],
  [{ description: 'top', key: ['home', 'pageup'] }, 'navigateSearch'],
  [{ description: 'select entry', key: 'enter' }, 'onEnd'],
  [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
]);

@Component({ type: 'menu' })
export class MenuComponentService<VALUE = unknown>
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
  private complete = false;
  private done: (type: VALUE) => void;
  private final = false;
  private headerPadding: number;
  private leftHeader: string;
  private mode: 'find' | 'select' = 'select';
  private numericSelection = '';
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
    this.rightHeader = this.opt.rightHeader ?? 'Menu';
    this.leftHeader = this.opt.leftHeader ?? 'Secondary';

    const defaultValue = this.side('right')[START]?.entry[VALUE];
    this.value ??= defaultValue;
    this.detectSide();
    this.done = done;
    this.setKeymap();
    const contained = this.side().find(i => i.entry[VALUE] === this.value);
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
      this.value = keyMap[mixed][VALUE];
      this.onEnd();
      return false;
    }
    const result = await callback(
      keyMap[mixed][VALUE],
      this.getSelected()?.entry,
    );
    if (is.string(result)) {
      this.callbackOutput = result;
      return;
    }
    if (result) {
      this.value = keyMap[mixed][VALUE];
      this.onEnd();
      return false;
    }
  }

  /**
   * Move the cursor to the bottom of the list
   */
  protected bottom(): void {
    const list = this.side();
    this.value = list[list.length - ARRAY_OFFSET].entry[VALUE];
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
      this.value = available[START].entry[VALUE];
      return;
    }
    if (['pagedown', 'end'].includes(key)) {
      this.value = available[available.length - ARRAY_OFFSET].entry[VALUE];
      return;
    }
    const index = available.findIndex(
      ({ entry }) => entry[VALUE] === this.value,
    );
    if (index === NOT_FOUND) {
      this.value = available[START].entry[VALUE];
      return;
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
  }

  /**
   * Move down 1 entry
   */
  protected next(): void {
    const list = this.side();
    const index = list.findIndex(i => i.entry[VALUE] === this.value);
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

  protected numberSelect(mixed: string): void {
    this.numericSelection = mixed;
    this.value =
      this.side()[
        Number(is.empty(this.numericSelection) ? '1' : this.numericSelection) -
          ARRAY_OFFSET
      ]?.entry[VALUE] ?? this.value;
  }

  /**
   * Terminate the editor
   */
  protected onEnd(): boolean {
    this.final = true;
    this.mode = 'select';
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
    let current = right.findIndex(i => i.entry[VALUE] === this.value);
    if (current === NOT_FOUND) {
      current = START;
    }
    if (current > left.length) {
      current = left.length - ARRAY_OFFSET;
    }
    this.value =
      left.length - ARRAY_OFFSET < current
        ? left[left.length - ARRAY_OFFSET].entry[VALUE]
        : left[current].entry[VALUE];
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
    let current = left.findIndex(i => i.entry[VALUE] === this.value);
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
        this.value = this.opt.keyMap[key][VALUE];
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
    const index = list.findIndex(i => i.entry[VALUE] === this.value);
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
    this.value = list[FIRST].entry[VALUE];
  }

  /**
   * Auto detect selectedType based on the current value
   */
  private detectSide(): void {
    const isLeftSide = this.side('left').some(
      i => i.entry[VALUE] === this.value,
    );
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
        const item = data.find(({ entry }) => entry[VALUE] === i[VALUE]);
        return {
          ...item,
          entry: i,
        };
      });
    if (updateValue) {
      this.value = is.empty(highlighted)
        ? undefined
        : highlighted[START].entry[VALUE];
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
    const out = list.find(i => i.entry[VALUE] === this.value);
    return out ?? list[START];
  }

  private renderFinal() {
    const item = this.selectedEntry();
    let message = '';
    if (!is.empty(item?.helpText)) {
      message += chalk`{blue ?} ${item.helpText
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
      message += chalk`\n \n {blue ?} ${selectedItem.helpText
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
    if (!is.empty(this.callbackOutput)) {
      message += this.callbackOutput + `\n\n`;
    }
    if (!is.empty(this.opt.headerMessage)) {
      message += this.opt.headerMessage + `\n\n`;
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
    const selectedItem = this.getSelected();
    if (!is.empty(selectedItem?.helpText)) {
      message += chalk`\n \n {blue ?} ${selectedItem.helpText
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
    menu = temporary.map(i =>
      menu.find(({ entry }) => i[VALUE] === entry[VALUE]),
    );

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
      const inverse = item.entry[VALUE] === this.value;
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
    ].find(item => item.entry[VALUE] === this.value);
  }

  private setKeymap(): void {
    const PARTIAL_LIST: tMenuItem[] = [
      [{ catchAll: true, noHelp: true }, 'activateKeyMap'],
      [{ key: 'down' }, 'next'],
      [{ description: 'select entry', key: 'enter' }, 'onEnd'],
      [{ key: 'up' }, 'previous'],
      [
        { description: 'select item', key: [...'0123456789'], noHelp: true },
        'numberSelect',
      ],
      ...((this.opt.condensed
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
      ...(this.opt.hideSearch ? [] : SEARCH),
    ]);
    this.keyboardService.setKeyMap(this, keymap);
  }

  /**
   * Retrieve a sorted list of entries
   *
   * In find mode, both lists get merged into a single one
   */
  private side(
    side: 'left' | 'right' = this.selectedType,
    noRecurse = false,
  ): MainMenuEntry<VALUE>[] {
    if (this.mode === 'find' && !noRecurse) {
      return [...this.side('right', true), ...this.side('left', true)];
    }
    // TODO: find way of caching the replacements
    // Might be an issue in large lists
    let temp = this.opt[side].map(
      item =>
        [item, ansiStrip(item.entry[LABEL]).replace(UNSORTABLE, '')] as [
          MainMenuEntry,
          string,
        ],
    );
    if (this.opt.sort !== false) {
      temp = temp.sort(([a, aLabel], [b, bLabel]) => {
        if (a.type === b.type) {
          return aLabel > bLabel ? UP : DOWN;
        }
        if (a.type > b.type) {
          return UP;
        }
        return DOWN;
      });
    }
    return temp.map(([item]) => item) as MainMenuEntry<VALUE>[];
  }
}
