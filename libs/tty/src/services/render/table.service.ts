import { Injectable } from '@nestjs/common';
import {
  ARRAY_OFFSET,
  EMPTY,
  INCREMENT,
  is,
  START,
} from '@steggy/utilities';
import chalk from 'chalk';
import { get } from 'object-path';

import { ColumnInfo, TABLE_PARTS, TableBuilderOptions } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { EnvironmentService } from '../meta/environment.service';
import { TextRenderingService } from './text-rendering.service';

const PADDING = 1;
const ROW_MULTIPLIER = 2;
const HEADER_LINE_COUNT = 4;
const MIN_CELL_WIDTH = ' undefined '.length;

@Injectable()
export class TableService {
  constructor(
    private readonly environment: EnvironmentService,
    private readonly textRender: TextRenderingService,
  ) {}

  private activeOptions: TableBuilderOptions<unknown>;
  private columns: ColumnInfo[];
  private selectedCell: number;
  private selectedRow: number;
  private values: Record<string, unknown>[];

  public renderTable(
    options: TableBuilderOptions<unknown>,
    renderRows: Record<string, unknown>[],
    selectedRow: number = START,
    selectedCell: number = START,
  ): string {
    this.selectedCell = selectedCell;
    this.selectedRow = selectedRow;
    this.activeOptions = options;
    this.values = renderRows;
    this.calcColumns();
    const header = this.header();
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
    return this.highlight(pre).join(`\n`);
  }

  private calcColumns(): void {
    this.columns = this.activeOptions.elements.map(item => {
      return {
        maxWidth: Math.max(
          MIN_CELL_WIDTH,
          PADDING + item.name.length + PADDING,
          PADDING +
            ansiMaxLength(
              ...this.values.map(row => {
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

  private header(): string[] {
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
        this.columns
          .map(
            i =>
              chalk`${' '.repeat(PADDING)}{bold.blue ${i.name.padEnd(
                i.maxWidth - PADDING,
                ' ',
              )}}`,
          )
          .join(TABLE_PARTS.middle),
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

  private highlight(lines: string[]): string[] {
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

  private highlightChar(char: string): string {
    return chalk.bold.red(char);
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
}
