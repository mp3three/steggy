import { INestApplication } from '@nestjs/common';
import { ARRAY_OFFSET, is, START, VALUE } from '@text-based/utilities';
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
  BooleanEditorRenderOptions,
  BooleanEditorService,
  ConfirmEditorRenderOptions,
  ConfirmEditorService,
  EnumEditorRenderOptions,
  EnumEditorService,
  KeymapService,
  NumberEditorRenderOptions,
  NumberEditorService,
  StringEditorRenderOptions,
  StringEditorService,
  TableService,
  TextRenderingService,
} from '../services';

export class ObjectBuilderPrompt extends InquirerPrompt<
  ObjectBuilderOptions<unknown>
> {
  private booleanEditor: BooleanEditorService;
  private confirmCB: (value: boolean) => void;
  private confirmService: ConfirmEditorService;
  private currentEditor: OBJECT_BUILDER_ELEMENT;
  private editorOptions: unknown;
  private enumEditor: EnumEditorService;
  private isSelected = false;
  private keymapService: KeymapService;
  private numberEditor: NumberEditorService;
  private rows: Record<string, unknown>[];
  private selectedCell = START;
  private selectedRow = START;
  private stringEditor: StringEditorService;
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
    const label = column.name;
    switch (column.type) {
      case OBJECT_BUILDER_ELEMENT.string:
        this.editorOptions = {
          current,
          label,
        } as StringEditorRenderOptions;
        return;
      case OBJECT_BUILDER_ELEMENT.enum:
        this.editorOptions = {
          current: current ?? column.options[START][VALUE],
          label,
          options: column.options,
        } as EnumEditorRenderOptions;
        return;
      case OBJECT_BUILDER_ELEMENT.boolean:
        this.editorOptions = {
          current,
          label,
        } as BooleanEditorRenderOptions;
        return;
      case OBJECT_BUILDER_ELEMENT.number:
        this.editorOptions = {
          current,
          label,
        } as NumberEditorRenderOptions;
        return;
    }
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
    this.stringEditor = app.get(StringEditorService);
    this.confirmService = app.get(ConfirmEditorService);
    this.booleanEditor = app.get(BooleanEditorService);
    this.numberEditor = app.get(NumberEditorService);
    this.enumEditor = app.get(EnumEditorService);
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
    const keymap = this.keymapService.keymapHelp(this.localKeyMap, {
      message,
      prefix: this.stringEditor.keyMap,
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
    switch (this.currentEditor) {
      case OBJECT_BUILDER_ELEMENT.string:
        this.editorOptions = this.stringEditor.onKeyPress(
          this.editorOptions as StringEditorRenderOptions,
          key,
          modifiers,
        );
        break;
      case OBJECT_BUILDER_ELEMENT.enum:
        this.editorOptions = this.enumEditor.onKeyPress(
          this.editorOptions as EnumEditorRenderOptions,
          key,
        );
        break;
      case OBJECT_BUILDER_ELEMENT.boolean:
        this.editorOptions = this.booleanEditor.onKeyPress(
          this.editorOptions as BooleanEditorRenderOptions,
          key,
        );
        break;
      case OBJECT_BUILDER_ELEMENT.number:
        this.editorOptions = this.numberEditor.onKeyPress(
          this.editorOptions as NumberEditorRenderOptions,
          key,
        );
        break;
      case OBJECT_BUILDER_ELEMENT.confirm:
        this.editorOptions = this.confirmService.onKeyPress(
          this.editorOptions as ConfirmEditorRenderOptions,
          key,
        );
        break;
    }
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
    const line = chalk.magenta.dim('='.repeat(width));
    switch (this.currentEditor) {
      case OBJECT_BUILDER_ELEMENT.string:
        return [
          line,
          this.stringEditor.render({
            ...(this.editorOptions as StringEditorRenderOptions),
            width,
          }),
        ];
      case OBJECT_BUILDER_ELEMENT.enum:
        return [
          line,
          this.enumEditor.render({
            ...(this.editorOptions as EnumEditorRenderOptions),
          }),
        ];
      case OBJECT_BUILDER_ELEMENT.boolean:
        return [
          line,
          this.booleanEditor.render({
            ...(this.editorOptions as BooleanEditorRenderOptions),
          }),
        ];
      case OBJECT_BUILDER_ELEMENT.number:
        return [
          line,
          this.numberEditor.render(
            {
              ...(this.editorOptions as NumberEditorRenderOptions),
            },
            width,
          ),
        ];
      case OBJECT_BUILDER_ELEMENT.confirm:
        return [
          this.confirmService.render(
            {
              ...(this.editorOptions as ConfirmEditorRenderOptions),
            },
            width,
          ),
        ];
    }
    return [];
  }
}
