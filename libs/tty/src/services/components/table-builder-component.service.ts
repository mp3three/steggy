import { ModuleScannerService } from '@automagical/boilerplate';
import { ARRAY_OFFSET, is, START } from '@automagical/utilities';
import chalk from 'chalk';
import { get, set } from 'object-path';

import {
  DirectCB,
  InquirerKeypressOptions,
  KeyModifiers,
  TABLE_CELL_TYPE,
  TableBuilderOptions,
} from '../../contracts';
import { Component, iComponent } from '../../decorators';
import { ansiMaxLength } from '../../includes';
import {
  ConfirmEditorRenderOptions,
  StringEditorRenderOptions,
} from '../editors';
import {
  ApplicationManagerService,
  KeyboardManagerService,
  ScreenService,
} from '../meta';
import {
  FooterEditorService,
  KeymapService,
  TableService,
  TextRenderingService,
} from '../render';

@Component({ type: 'table' })
export class TableBuilderComponentService<VALUE = unknown>
  implements iComponent<TableBuilderOptions<VALUE>, VALUE>
{
  constructor(
    private readonly tableService: TableService,
    private readonly textRendering: TextRenderingService,
    private readonly moduleScanner: ModuleScannerService,
    private readonly footerEditor: FooterEditorService,
    private readonly keymapService: KeymapService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
  ) {}
  private confirmCB: (value: boolean) => void;
  private currentEditor: string;
  private done: (type: VALUE[]) => void;
  private editorOptions: unknown;
  private isSelected = false;
  private opt: TableBuilderOptions<VALUE>;
  private rows: VALUE[];
  private selectedCell = START;
  private selectedRow = START;

  public configure(
    config: TableBuilderOptions<VALUE>,
    done: (type: VALUE[]) => void,
  ): void {
    this.opt = config;
    this.done = done;
    this.opt.current ??= [];
    this.rows = Array.isArray(this.opt.current)
      ? this.opt.current
      : [this.opt.current];
    this.createKeymap();
  }

  public render(): void {
    const message = this.textRendering.pad(
      this.tableService.renderTable(
        this.opt,
        this.rows as Record<string, unknown>[],
        this.selectedRow,
        this.selectedCell,
      ),
    );

    const column = this.opt.elements[this.selectedCell];
    const keymap = this.keymapService.keymapHelp({
      message,
      prefix: this.currentEditor
        ? this.footerEditor.getKeyMap(
            this.currentEditor,
            column,
            this.rows[this.selectedRow],
          )
        : new Map(),
    });
    const max = ansiMaxLength(keymap, message);
    this.screenService.render(
      message,
      [` `, ...this.renderEditor(max), keymap].join(`\n`),
    );
  }

  private get columns() {
    return this.opt.elements;
  }

  protected add(): void {
    this.rows.push({} as VALUE);
  }

  protected async delete(): Promise<void> {
    const result = await new Promise<boolean>(done => {
      this.confirmCB = done;
      this.currentEditor = TABLE_CELL_TYPE.confirm;
      this.editorOptions = {
        current: false,
        label: `Are you sure you want to delete this?`,
      } as ConfirmEditorRenderOptions;
      this.render();
    });
    this.currentEditor = undefined;
    this.editorOptions = undefined;
    this.confirmCB = undefined;
    if (!result) {
      return;
    }
    this.rows = this.rows.filter((item, index) => index !== this.selectedRow);
    if (this.selectedRow > this.rows.length - ARRAY_OFFSET) {
      this.selectedRow = this.rows.length - ARRAY_OFFSET;
    }
    this.render();
  }

  protected editComplete(): void {
    if (!this.currentEditor) {
      return;
    }
    if (this.confirmCB) {
      this.confirmCB(
        (this.editorOptions as ConfirmEditorRenderOptions).current,
      );
      return;
    }
    const column = this.opt.elements[this.selectedCell];
    const current = this.rows[this.selectedRow];
    set(
      is.object(current) ? current : {},
      column.path,
      (this.editorOptions as StringEditorRenderOptions).current,
    );
    this.currentEditor = undefined;
    this.editorOptions = undefined;
  }

  protected enableEdit(): void {
    this.keyboardService.wrap(async () => {
      const column = this.opt.elements[this.selectedCell];
      this.currentEditor = await column.type;
      const row = this.rows[this.selectedRow];
      const current = get(is.object(row) ? row : {}, column.path);
      this.editorOptions = this.footerEditor.initConfig(current, column);
    });
  }

  protected onDown(): boolean {
    if (this.selectedRow === this.rows.length - ARRAY_OFFSET) {
      return false;
    }
    this.selectedRow++;
  }

  protected onEnd(): void {
    this.done(this.rows);
  }

  protected onLeft(): boolean {
    if (this.selectedCell === START) {
      return false;
    }
    this.selectedCell--;
  }

  protected onRight(): boolean {
    if (this.selectedCell === this.columns.length - ARRAY_OFFSET) {
      return false;
    }
    this.selectedCell++;
  }

  protected onUp(): boolean {
    if (this.selectedRow === START) {
      return false;
    }
    this.selectedRow--;
  }
  protected selectCell(): void {
    this.isSelected = !this.isSelected;
  }

  private createKeymap(): void {
    this.keyboardService.setKeyMap(
      this,
      new Map([
        // While there is no editor
        ...[
          [
            { description: 'done', key: 's', modifiers: { ctrl: true } },
            'onEnd',
          ],
          [{ description: 'cursor left', key: 'left' }, 'onLeft'],
          [{ description: 'cursor right', key: 'right' }, 'onRight'],
          [{ description: 'cursor up', key: 'up' }, 'onUp'],
          [{ description: 'cursor down', key: 'down' }, 'onDown'],
          [{ description: 'add row', key: '+' }, 'add'],
          [{ description: 'delete row', key: ['-', 'delete'] }, 'delete'],
          [{ description: 'edit cell', key: 'enter' }, 'enableEdit'],
        ].map(
          ([options, key]: [{ description: string; key: string }, string]) => [
            { active: () => is.empty(this.currentEditor), ...options },
            key,
          ],
        ),
        // Only with editor
        ...[
          [{ description: 'done editing', key: 'enter' }, 'editComplete'],
        ].map(
          ([options, key]: [{ description: string; key: string }, string]) => [
            { active: () => !is.empty(this.currentEditor), ...options },
            key,
          ],
        ),
        // Others
        [
          { catchAll: true, noHelp: true },
          (key, modifiers) => this.editorKeyPress(key, modifiers),
        ],
      ] as [InquirerKeypressOptions, string | DirectCB][]),
    );
  }

  private async editorKeyPress(
    key: string,
    modifiers: KeyModifiers,
  ): Promise<void> {
    if (!this.currentEditor) {
      return;
    }
    const column = this.opt.elements[this.selectedCell];
    this.editorOptions = await this.footerEditor.onKeyPress(
      column,
      this.editorOptions,
      key,
      modifiers,
      this.currentEditor,
    );
    if (is.undefined(this.editorOptions)) {
      // It cancelled itself
      this.currentEditor = undefined;
    }
    this.render();
  }

  private renderEditor(width: number): string[] {
    if (!this.currentEditor) {
      return [];
    }
    const column = this.opt.elements[this.selectedCell];
    const line = chalk`{${this.footerEditor.lineColor(
      this.currentEditor,
      this.editorOptions,
    )} ${'='.repeat(width)}}`;
    return [
      line,
      this.footerEditor.render(
        column,
        this.editorOptions,
        width,
        this.currentEditor,
      ),
    ];
  }
}