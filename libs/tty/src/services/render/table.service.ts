import { Injectable } from '@nestjs/common';
import { ARRAY_OFFSET, EMPTY, INCREMENT, is, START } from '@steggy/utilities';
import chalk from 'chalk';
import { get } from 'object-path';

import { ColumnInfo, TABLE_PARTS, TableBuilderOptions } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { EnvironmentService } from '../meta/environment.service';
import { TextRenderingService } from './text-rendering.service';

const PADDING = 1;
const DOUBLE_PADDING = 2;

const ROW_MULTIPLIER = 2;
const HEADER_LINE_COUNT = 4;
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
  private value: VALUE;
  private values: VALUE[];

  public renderForm(
    options: TableBuilderOptions<unknown>,
    row: VALUE,
    selectedRow: number = START,
  ): string {
    this.value = row;
    this.activeOptions = options;
    this.selectedRow = selectedRow;
    this.calcColumns([this.value]);
    const maxLength = Math.max(
      ...this.activeOptions.elements.map(({ name }) => name.length),
    );
    const header = this.formBody(maxLength);
    return [...header].join(`\n`);
  }

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
    const rows = r
      .join(
        `\n` +
          [
            TABLE_PARTS.left_mid,
            this.columns
              .map(i => TABLE_PARTS.bottom.repeat(i.maxWidth))
              .join(TABLE_PARTS.mid_mid),
            TABLE_PARTS.right_mid,
          ].join('') +
          `\n`,
      )
      .split(`\n`);
    const footer = this.footer();
    const pre = [...header, ...rows, footer];
    return this.highlightRow(pre).join(`\n`);
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
                if (item.format) {
                  return item.format(value);
                }
                return String(value);
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

  private formBody(max: number): string[] {
    const maxValue =
      DOUBLE_PADDING +
      ansiMaxLength(
        ...this.columns.map(i => this.textRender.type(get(this.value, i.path))),
      );
    const maxLabel = ansiMaxLength(this.columns.map(({ name }) => name));

    const columns = this.columns.map((i, index) =>
      this.renderValue({ i, index, max, maxLabel, maxValue }),
    );
    return [
      [
        TABLE_PARTS.top_left,
        TABLE_PARTS.top.repeat(max),
        TABLE_PARTS.top_mid,
        TABLE_PARTS.top.repeat(maxValue),
        TABLE_PARTS.top_right,
      ].join(``),
      columns.join(
        `\n` +
          [
            TABLE_PARTS.left_mid,
            TABLE_PARTS.mid.repeat(max),
            TABLE_PARTS.mid_mid,
            TABLE_PARTS.mid.repeat(maxValue),
            TABLE_PARTS.right_mid,
          ].join(``) +
          `\n`,
      ),
      [
        TABLE_PARTS.bottom_left,
        TABLE_PARTS.top.repeat(max),
        TABLE_PARTS.bottom_mid,
        TABLE_PARTS.top.repeat(maxValue),
        TABLE_PARTS.bottom_right,
      ].join(''),
    ];
  }

  private highlightChar(char: string): string {
    return chalk.bold.red(char);
  }

  private highlightRow(lines: string[]): string[] {
    if (is.empty(this.values)) {
      return;
    }
    const bottom = HEADER_LINE_COUNT + this.selectedRow * ROW_MULTIPLIER;
    const middle = bottom - ARRAY_OFFSET;
    const top = middle - ARRAY_OFFSET;
    const list = this.columns
      .slice(START, this.selectedCell)
      .map(({ maxWidth }) => maxWidth);
    const start = is.empty(list)
      ? EMPTY
      : list.reduce((a, b) => a + b) + this.selectedCell;
    const end =
      start + this.columns[this.selectedCell].maxWidth + PADDING + PADDING;
    return lines.map((line, index) => {
      if (![middle, top, bottom].includes(index)) {
        return line;
      }
      if ([top, bottom].includes(index)) {
        return (
          line.slice(START, start) +
          this.highlightChar(line.slice(start, end)) +
          line.slice(end)
        );
      }
      return line;
    });
  }

  private renderValue({
    i,
    index,
    max,
    maxLabel,
    maxValue,
  }: {
    i: ColumnInfo;
    index: number;
    max: number;
    maxLabel: number;
    maxValue: number;
  }): string {
    const raw = get(this.value, i.path);
    const v = this.textRender.type(raw);
    const lines = v.split(`\n`).length;
    const values = (index === this.selectedRow ? chalk.inverse(v) : v).split(
      `\n`,
    );
    const labels = (NAME_CELL(i, max) + `\n`.repeat(lines - INCREMENT)).split(
      `\n`,
    );
    return labels
      .map((labelLine, labelIndex) => {
        return [
          TABLE_PARTS.left,
          ansiPadEnd(labelLine, maxLabel + DOUBLE_PADDING),
          TABLE_PARTS.middle,
          ansiPadEnd(' ' + values[labelIndex], maxValue),
          TABLE_PARTS.right,
        ].join('');
      })
      .join(`\n`);
  }

  private rows(): string[] {
    const out = this.values.map((i, rowIndex) => {
      return [
        rowIndex === this.selectedRow && this.selectedCell === START
          ? this.highlightChar(TABLE_PARTS.left)
          : TABLE_PARTS.left,
        ...this.activeOptions.elements.map((element, colIndex) => {
          const value = get(i, element.path);
          const content =
            ' '.repeat(PADDING) +
            this.textRender.type(
              element.format ? element.format(value) : value,
            );
          const cell = ansiPadEnd(content, this.columns[colIndex].maxWidth);
          const append =
            colIndex === this.columns.length - ARRAY_OFFSET
              ? TABLE_PARTS.right
              : TABLE_PARTS.middle;
          return (
            cell +
            (rowIndex === this.selectedRow &&
            [colIndex, colIndex + INCREMENT].includes(this.selectedCell)
              ? this.highlightChar(append)
              : append)
          );
        }),
      ].join('');
    });
    return out;
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
