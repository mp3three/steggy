import { INestApplication } from '@nestjs/common';
import { ARRAY_OFFSET, START } from '@text-based/utilities';
import chalk from 'chalk';

import { ansiMaxLength } from '..';
import { ObjectBuilderOptions } from '../contracts';
import { InquirerPrompt, tKeyMap } from '../decorators';
import {
  KeymapService,
  StringEditorService,
  TableService,
  TextRenderingService,
} from '../services';

const NAVICATION_KEYMAP = new Map([
  [{ description: 'cursor left', key: 'left' }, 'onLeft'],
  [{ description: 'cursor right', key: 'right' }, 'onRight'],
  [{ description: 'cursor up', key: 'up' }, 'onUp'],
  [{ description: 'cursor down', key: 'down' }, 'onDown'],
  [{ key: 'tab' }, 'selectCell'],
]) as tKeyMap;

export class ObjectBuilderPrompt extends InquirerPrompt<ObjectBuilderOptions> {
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

  protected onDown(): boolean {
    if (this.selectedRow === this.rows.length) {
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
    this.setKeyMap(NAVICATION_KEYMAP);
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
    const keymap = this.keymapService.keymapHelp(this['localKeyMap'], {
      message,
    });
    const max = ansiMaxLength(keymap, message);

    this.screen.render(
      message,
      [
        //
        ` `,
        chalk.blue.dim('='.repeat(max)),
        this.stringEditor.render({
          current: '',
          placeholder: 'test',
          width: max,
        }),
        keymap,
      ].join(`\n`),
    );
  }

  protected selectCell(): void {
    this.isSelected = !this.isSelected;
  }
}
