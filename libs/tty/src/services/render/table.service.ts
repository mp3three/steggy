import { Injectable } from '@nestjs/common';
import { ARRAY_OFFSET, is, START } from '@steggy/utilities';
import chalk from 'chalk';
import { get } from 'object-path';

import { ColumnInfo, TABLE_PARTS, TableBuilderOptions } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { EnvironmentService } from '../meta/environment.service';
import { TextRenderingService } from './text-rendering.service';

const PADDING = 1;

const MIN_CELL_WIDTH = ' undefined '.length;

const NAME_CELL = (i: ColumnInfo, max?: number) =>
  chalk`${' '.repeat(PADDING)}{bold.blue ${i.name.padEnd(
    (max ?? i.maxWidth) - PADDING,
    ' ',
  )}}`;

@Injectable()
export class TableService<VALUE extends object = Record<string, unknown>> {
  constructor(
    private readonly environment: EnvironmentService,
    private readonly textRender: TextRenderingService,
  ) {}

  private activeOptions: TableBuilderOptions<unknown>;
  private columns: ColumnInfo[];
  private selectedCell: number;
  private selectedRow: number;
  private values: VALUE[];

  public renderTable(
    options: TableBuilderOptions<unknown>,
    renderRows: VALUE[],
    selectedRow: number = START,
    selectedCell: number = START,
  ): string {
    this.selectedCell = selectedCell;
    this.selectedRow = selectedRow;
    this.activeOptions = options;
    this.values = renderRows;
    this.calcColumns(this.values);
    const header = this.tableHeader();
    const r = this.rows();
    if (is.empty(r)) {
      const [top, content] = header;
      return [top, content, this.footer()].join(`\n`);
    }
    const middle_bar = [
      TABLE_PARTS.left_mid,
      this.columns
        .map(i => TABLE_PARTS.bottom.repeat(i.maxWidth))
        .join(TABLE_PARTS.mid_mid),
      TABLE_PARTS.right_mid,
    ].join('');
    return [...header, r.join(`\n` + middle_bar + `\n`), this.footer()].join(
      `\n`,
    );
  }

  private calcColumns(values: VALUE[]): void {
    this.columns = this.activeOptions.elements.map(item => {
      return {
        maxWidth: Math.max(
          MIN_CELL_WIDTH,
          PADDING + item.name.length + PADDING,
          PADDING +
            ansiMaxLength(
              ...values.map(row => {
                const value = get(row, item.path);
                return item.format
                  ? item.format(value)
                  : this.textRender.type(value);
              }),
            ) +
            PADDING,
        ),
        name: item.name,
        path: item.path,
      };
    });
  }

  private footer(): string {
    return [
      TABLE_PARTS.bottom_left,
      this.columns
        .map(i => TABLE_PARTS.bottom.repeat(i.maxWidth))
        .join(TABLE_PARTS.bottom_mid),
      TABLE_PARTS.bottom_right,
    ].join('');
  }

  private rows(): string[] {
    return this.values.map((i, rowIndex) => {
      return [
        TABLE_PARTS.left,
        ...this.activeOptions.elements.map((element, colIndex) => {
          const value = get(i, element.path);
          const types = element.format
            ? element.format(value)
            : this.textRender.type(value);
          const content =
            ' '.repeat(PADDING) +
            (this.selectedRow === rowIndex && this.selectedCell === colIndex
              ? chalk.inverse(types)
              : types);
          const cell = ansiPadEnd(content, this.columns[colIndex].maxWidth);
          const append =
            colIndex === this.columns.length - ARRAY_OFFSET
              ? TABLE_PARTS.right
              : TABLE_PARTS.middle;
          return cell + append;
        }),
      ].join('');
    });
  }

  private tableHeader(): string[] {
    return [
      [
        TABLE_PARTS.top_left,
        this.columns
          .map(i => TABLE_PARTS.top.repeat(i.maxWidth))
          .join(TABLE_PARTS.top_mid),
        TABLE_PARTS.top_right,
      ].join(``),
      [
        TABLE_PARTS.left,
        this.columns.map(i => NAME_CELL(i)).join(TABLE_PARTS.middle),
        TABLE_PARTS.right,
      ].join(''),
      [
        TABLE_PARTS.left_mid,
        this.columns
          .map(i => TABLE_PARTS.mid.repeat(i.maxWidth))
          .join(TABLE_PARTS.mid_mid),
        TABLE_PARTS.right_mid,
      ].join(''),
    ];
  }
}
