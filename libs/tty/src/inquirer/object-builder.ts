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
  EnumEditorRenderOptions,
  EnumEditorService,
  KeymapService,
  StringEditorRenderOptions,
  StringEditorService,
  TableService,
  TextRenderingService,
} from '../services';

export class ObjectBuilderPrompt extends InquirerPrompt<ObjectBuilderOptions> {
  private currentEditor: OBJECT_BUILDER_ELEMENT;
  private currentEditorOptions: unknown;
  private enumEditor: EnumEditorService;
  private isSelected = false;
  private keymapService: KeymapService;
  private rows: Record<string, unknown>[];
  private selectedCell = START;
  private selectedRow = START;
  private stringEditor: StringEditorService;
  private tableService: TableService;
  private textRendering: TextRenderingService;

  private get columns() {
    return this.opt.elements;
  }

  protected editComplete(): void {
    if (!this.currentEditor) {
      return;
    }
    const column = this.opt.elements[this.selectedCell];
    switch (this.currentEditor) {
      case OBJECT_BUILDER_ELEMENT.string:
      case OBJECT_BUILDER_ELEMENT.enum:
        set(
          this.rows[this.selectedRow],
          column.path,
          (this.currentEditorOptions as StringEditorRenderOptions).current,
        );
        break;
    }
    this.currentEditor = undefined;
    this.currentEditorOptions = undefined;
  }

  protected enableEdit(): boolean {
    if (this.currentEditor) {
      return false;
    }
    const column = this.opt.elements[this.selectedCell];
    this.currentEditor = column.type;
    switch (column.type) {
      case OBJECT_BUILDER_ELEMENT.string:
        this.currentEditorOptions = {
          current: get(this.rows[this.selectedRow], column.path),
          label: column.name,
        } as StringEditorRenderOptions;
        return;
      case OBJECT_BUILDER_ELEMENT.enum:
        this.currentEditorOptions = {
          current: get(this.rows[this.selectedRow], column.path),
          label: column.name,
          options: column.options.enum.map((i) => [i, i]),
        } as EnumEditorRenderOptions;
    }
  }

  protected onDown(): boolean {
    if (this.selectedRow === this.rows.length - ARRAY_OFFSET) {
      return false;
    }
    this.selectedRow++;
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
          [{ description: 'cursor left', key: 'left' }, 'onLeft'],
          [{ description: 'cursor right', key: 'right' }, 'onRight'],
          [{ description: 'cursor up', key: 'up' }, 'onUp'],
          [{ description: 'cursor down', key: 'down' }, 'onDown'],
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
        this.currentEditorOptions = this.stringEditor.onKeyPress(
          this.currentEditorOptions as StringEditorRenderOptions,
          key,
          modifiers,
        );
        break;
      case OBJECT_BUILDER_ELEMENT.enum:
        this.currentEditorOptions = this.enumEditor.onKeyPress(
          this.currentEditorOptions as EnumEditorRenderOptions,
          key,
          // modifiers,
        );
        break;
    }
    if (is.undefined(this.currentEditorOptions)) {
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
            ...(this.currentEditorOptions as StringEditorRenderOptions),
            width,
          }),
        ];
      case OBJECT_BUILDER_ELEMENT.enum:
        return [
          line,
          this.enumEditor.render({
            ...(this.currentEditorOptions as EnumEditorRenderOptions),
          }),
        ];
    }
    return [];
  }
}
