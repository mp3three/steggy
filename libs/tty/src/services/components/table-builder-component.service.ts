import { forwardRef, Inject } from '@nestjs/common';
import { ARRAY_OFFSET, is, START } from '@steggy/utilities';
import { get, set } from 'object-path';

import {
  DirectCB,
  TTYKeypressOptions,
  TableBuilderElement,
  TableBuilderOptions,
  tKeyMap,
} from '../../contracts';
import { Component, iComponent } from '../../decorators';
import {
  ApplicationManagerService,
  KeyboardManagerService,
  ScreenService,
} from '../meta';
import { PromptService } from '../prompt.service';
import { KeymapService, TableService, TextRenderingService } from '../render';
import { FooterEditorService } from './footer-editor.service';
import { ToMenuEntry } from './menu-component.service';

const KEYMAP: tKeyMap = new Map([
  // While there is no editor
  [{ description: 'done', key: 'd' }, 'onEnd'],
  [{ description: 'cursor left', key: 'left' }, 'onLeft'],
  [{ description: 'cursor right', key: 'right' }, 'onRight'],
  [{ description: 'cursor up', key: 'up' }, 'onUp'],
  [{ description: 'cursor down', key: 'down' }, 'onDown'],
  [{ description: 'add row', key: '+' }, 'add'],
  [{ description: 'delete row', key: ['-', 'delete'] }, 'delete'],
  [{ description: 'edit cell', key: 'enter' }, 'enableEdit'],
] as [TTYKeypressOptions, string | DirectCB][]);

@Component({ type: 'table' })
export class TableBuilderComponentService<VALUE = unknown>
  implements iComponent<TableBuilderOptions<VALUE>, VALUE>
{
  constructor(
    private readonly tableService: TableService,
    private readonly textRendering: TextRenderingService,
    private readonly footerEditor: FooterEditorService,
    private readonly keymapService: KeymapService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
    @Inject(forwardRef(() => PromptService))
    private readonly promptService: PromptService,
  ) {}

  private done: (type: VALUE[]) => void;
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
    this.keyboardService.setKeyMap(this, KEYMAP);
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
    this.screenService.render(
      message,
      this.keymapService.keymapHelp({
        message,
      }),
    );
  }

  private get columns() {
    return this.opt.elements;
  }

  protected add(): void {
    this.rows.push({} as VALUE);
    // ? Needs an extra render for some reason
    // Should be unnecessary
    this.render();
  }

  protected async delete(): Promise<boolean> {
    const result = await this.screenService.footerWrap(async () => {
      return await this.promptService.confirm(
        'Are you sure you want to delete this?',
      );
    });
    if (!result) {
      this.render();
      return;
    }
    this.rows = this.rows.filter((item, index) => index !== this.selectedRow);
    if (this.selectedRow > this.rows.length - ARRAY_OFFSET) {
      this.selectedRow = this.rows.length - ARRAY_OFFSET;
    }
    this.render();
    return false;
  }

  protected async enableEdit(): Promise<void> {
    await this.screenService.footerWrap(async () => {
      const column = this.opt.elements[
        this.selectedCell
      ] as TableBuilderElement<{ options: string[] }>;
      const row = this.rows[this.selectedRow];
      const current = get(is.object(row) ? row : {}, column.path);
      let value: unknown;
      switch (column.type) {
        case 'date':
          value = await this.promptService.date({
            current,
            label: column.name,
          });
          break;
        case 'number':
          value = await this.promptService.number(column.name, current);
          break;
        case 'boolean':
          value = await this.promptService.boolean(column.name, current);
          break;
        case 'string':
          value = await this.promptService.string(column.name, current);
          break;
        case 'enum':
          value = await this.promptService.pickOne(
            column.name,
            ToMenuEntry(column.extra.options.map(i => [i, i])),
            current,
          );
          break;
      }
      set(is.object(row) ? row : {}, column.path, value);
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
}
