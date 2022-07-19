import { forwardRef, Inject } from '@nestjs/common';
import { ARRAY_OFFSET, is, START } from '@steggy/utilities';
import { get, set } from 'object-path';

import {
  DirectCB,
  TableBuilderElement,
  TableBuilderOptions,
  tKeyMap,
  TTYKeypressOptions,
} from '../contracts';
import { Component, iComponent } from '../decorators';
import {
  FormService,
  KeyboardManagerService,
  KeymapService,
  PromptService,
  ScreenService,
  TableService,
  TextRenderingService,
} from '../services';
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
const FORM_KEYMAP: tKeyMap = new Map([
  // While there is no editor
  [{ description: 'done', key: 'd' }, 'onEnd'],
  [{ description: 'cursor up', key: 'up' }, 'onUp'],
  [{ description: 'cursor down', key: 'down' }, 'onDown'],
  [{ description: 'edit cell', key: 'enter' }, 'enableEdit'],
] as [TTYKeypressOptions, string | DirectCB][]);

@Component({ type: 'table' })
export class TableBuilderComponentService<
  VALUE extends object = Record<string, unknown>,
> implements iComponent<TableBuilderOptions<VALUE>, VALUE>
{
  constructor(
    private readonly table: TableService<VALUE>,
    private readonly form: FormService<VALUE>,
    private readonly text: TextRenderingService,
    private readonly keymap: KeymapService,
    private readonly screen: ScreenService,
    private readonly keyboard: KeyboardManagerService,
    @Inject(forwardRef(() => PromptService))
    private readonly prompt: PromptService,
  ) {}

  private complete = false;
  private done: (type: VALUE | VALUE[]) => void;
  private opt: TableBuilderOptions<VALUE>;
  private rows: VALUE[];
  private selectedCell = START;
  private selectedRow = START;
  private value: VALUE;

  public configure(
    config: TableBuilderOptions<VALUE>,
    done: (type: VALUE[]) => void,
  ): void {
    this.complete = false;
    this.opt = config;
    this.done = done;
    this.opt.current ??= [];
    this.rows = Array.isArray(this.opt.current)
      ? this.opt.current
      : [this.opt.current];
    if (config.mode === 'single') {
      this.value = (config.current as VALUE) ?? ({} as VALUE);
    }
    this.keyboard.setKeyMap(
      this,
      this.opt.mode === 'single' ? FORM_KEYMAP : KEYMAP,
    );
  }

  public render(): void {
    if (this.complete) {
      this.screen.render('', '');
      return;
    }
    const mode = this.opt.mode ?? 'multi';
    if (mode === 'single') {
      this.renderSingle();
      return;
    }
    this.renderMulti();
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
    const result = await this.screen.footerWrap(async () => {
      return await this.prompt.confirm('Are you sure you want to delete this?');
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
    await this.screen.footerWrap(async () => {
      const column = this.opt.elements[
        this.opt.mode === 'single' ? this.selectedRow : this.selectedCell
      ] as TableBuilderElement<{ options: string[] }>;
      const row =
        this.opt.mode === 'single' ? this.value : this.rows[this.selectedRow];
      const current = get(is.object(row) ? row : {}, column.path);
      let value: unknown;
      switch (column.type) {
        case 'date':
          value = await this.prompt.date({
            current,
            label: column.name,
          });
          break;
        case 'number':
          value = await this.prompt.number(column.name, current);
          break;
        case 'boolean':
          value = await this.prompt.boolean(column.name, current);
          break;
        case 'string':
          value = await this.prompt.string(column.name, current);
          break;
        case 'enum':
          value = await this.prompt.pickOne(
            column.name,
            ToMenuEntry(column.extra.options.map(i => [i, i])),
            current,
          );
          break;
      }
      set(is.object(row) ? row : {}, column.path, value);
    });
    this.render();
  }

  protected onDown(): boolean {
    if (this.opt.mode !== 'single') {
      if (this.selectedRow === this.rows.length - ARRAY_OFFSET) {
        this.selectedRow = START;
        return;
      }
    } else if (this.selectedRow === this.opt.elements.length - ARRAY_OFFSET) {
      this.selectedRow = START;
      return;
    }
    this.selectedRow++;
  }

  protected onEnd(): void {
    this.complete = true;
    this.render();
    if (this.opt.mode === 'single') {
      this.done(this.value as VALUE);
      return;
    }
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
      this.selectedRow =
        (this.opt.mode === 'multi' ? this.rows.length : this.columns.length) -
        ARRAY_OFFSET;
      return;
    }
    this.selectedRow--;
  }

  private renderMulti(): void {
    const message = this.text.pad(
      this.table.renderTable(
        this.opt,
        this.rows,
        this.selectedRow,
        this.selectedCell,
      ),
    );
    this.screen.render(
      message,
      this.keymap.keymapHelp({
        message,
      }),
    );
  }

  private renderSingle(): void {
    const message = this.text.pad(
      this.form.renderForm(this.opt, this.value, this.selectedRow),
    );
    this.screen.render(
      message,
      this.keymap.keymapHelp({
        message,
      }),
    );
  }
}
