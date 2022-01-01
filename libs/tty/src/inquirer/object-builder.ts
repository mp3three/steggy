import { INestApplication } from '@nestjs/common';
import { ARRAY_OFFSET, START } from '@text-based/utilities';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { ObjectBuilderOptions } from '../contracts';
import { InquirerPrompt } from '../decorators';
import { TableService } from '../services';

export class ObjectBuilderPrompt extends InquirerPrompt<ObjectBuilderOptions> {
  private isSelected = false;
  private rows: Record<string, unknown>[];
  private selectedCell = START;
  private selectedRow = START;
  private tableService: TableService;

  private get columns() {
    return this.opt.elements;
  }

  protected onDown(): boolean {
    if (this.selectedRow === this.rows.length) {
      return false;
    }
    this.selectedRow++;
  }

  protected async onInit(app: INestApplication): Promise<void> {
    this.opt.current ??= [];
    this.rows = Array.isArray(this.opt.current)
      ? this.opt.current
      : [this.opt.current];
    this.tableService = await app.get(TableService);
    this.localKeyMap = new Map([
      [{ key: 'left' }, 'onLeft'],
      [{ key: 'right' }, 'onRight'],
      [{ key: 'up' }, 'onUp'],
      [{ key: 'down' }, 'onDown'],
      [{ key: 'tab' }, 'selectCell'],
    ]);
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
    this.screen.render(
      this.tableService.renderTable(
        this.opt,
        this.selectedRow,
        this.selectedCell,
      ),
      '',
    );
  }

  protected selectCell(): void {
    this.isSelected = !this.isSelected;
  }
}
inquirer.registerPrompt('objectBuilder', ObjectBuilderPrompt);
