import { INestApplication } from '@nestjs/common';
import { ARRAY_OFFSET, is, START } from '@text-based/utilities';
import chalk from 'chalk';
import { get, set } from 'object-path';

import { OBJECT_BUILDER_ELEMENT, ObjectBuilderOptions } from '../contracts';
import {
  DirectCB,
  InquirerKeypressOptions,
  InquirerPrompt,
  KeyModifiers,
} from '../decorators';
import { ansiMaxLength } from '../includes';
import {
  ConfirmEditorRenderOptions,
  ConfirmEditorService,
  KeymapService,
  StringEditorRenderOptions,
  TableService,
  TextRenderingService,
} from '../services';
import { FooterEditorService } from '../services/render/footer-editor.service';

export class ObjectBuilderPrompt extends InquirerPrompt<
  ObjectBuilderOptions<unknown>
> {
  private confirmCB: (value: boolean) => void;
  private confirmService: ConfirmEditorService;
  private currentEditor: string;
  private editorOptions: unknown;
  private footerEditor: FooterEditorService;
  private isSelected = false;
  private keymapService: KeymapService;
  private rows: Record<string, unknown>[];
  private selectedCell = START;
  private selectedRow = START;
  private tableService: TableService;
  private textRendering: TextRenderingService;

  private get columns() {
    return this.opt.elements;
  }

  protected add(): void {
    this.rows.push({});
  }

  protected async delete(): Promise<void> {
    this.currentEditor = OBJECT_BUILDER_ELEMENT.confirm;
    this.editorOptions = {
      current: false,
      label: `Are you sure you want to delete this?`,
    } as ConfirmEditorRenderOptions;
    const result = await new Promise<boolean>(
      (done) => (this.confirmCB = done),
    );
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
    set(
      this.rows[this.selectedRow],
      column.path,
      (this.editorOptions as StringEditorRenderOptions).current,
    );
    this.currentEditor = undefined;
    this.editorOptions = undefined;
  }

  protected enableEdit(): boolean {
    if (this.currentEditor) {
      return false;
    }
    const column = this.opt.elements[this.selectedCell];
    this.currentEditor = column.type;
    this.confirmCB = undefined;
    const current = get(this.rows[this.selectedRow], column.path);
    this.editorOptions = this.footerEditor.initConfig(current, column);
  }

  protected onDown(): boolean {
    if (this.selectedRow === this.rows.length - ARRAY_OFFSET) {
      return false;
    }
    this.selectedRow++;
  }

  protected onEnd(): void {
    super.onEnd();
    this.done(this.rows);
  }

  protected onInit(app: INestApplication): void {
    this.opt.current ??= [];
    this.rows = Array.isArray(this.opt.current)
      ? this.opt.current
      : [this.opt.current];
    this.tableService = app.get(TableService);
    this.textRendering = app.get(TextRenderingService);
    this.keymapService = app.get(KeymapService);
    this.confirmService = app.get(ConfirmEditorService);
    this.createKeymap();
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

  protected render(): void {
    if (this.status === 'answered') {
      this.screen.render(chalk``, '');
      return;
    }
    const message = this.textRendering.pad(
      this.tableService.renderTable(
        this.opt,
        this.rows,
        this.selectedRow,
        this.selectedCell,
      ),
    );
    const column = this.opt.elements[this.selectedCell];

    const keymap = this.keymapService.keymapHelp(this.localKeyMap, {
      message,
      prefix: this.footerEditor.getKeyMap(column),
    });
    const max = ansiMaxLength(keymap, message);
    this.screen.render(
      message,
      [` `, ...this.renderEditor(max), keymap].join(`\n`),
    );
  }

  protected selectCell(): void {
    this.isSelected = !this.isSelected;
  }

  private createKeymap(): void {
    this.setKeyMap(
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
          [{ description: 'edit cell', key: 'tab' }, 'enableEdit'],
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
        // Typescript typing having a dumb here
      ] as [InquirerKeypressOptions, string | DirectCB][]),
    );
  }

  private editorKeyPress(key: string, modifiers: KeyModifiers): void {
    const column = this.opt.elements[this.selectedCell];
    this.editorOptions = this.footerEditor.onKeyPress(
      column,
      this.editorOptions,
      key,
      modifiers,
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
      column,
      this.editorOptions,
    )} ${'='.repeat(width)}}`;
    return [line, this.footerEditor.render(column, this.editorOptions, width)];
  }
}
