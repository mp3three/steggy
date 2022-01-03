import { Injectable } from '@nestjs/common';
import {
  ARRAY_OFFSET,
  EMPTY,
  INCREMENT,
  is,
  START,
} from '@text-based/utilities';
import chalk from 'chalk';
import { get } from 'object-path';

import { ColumnInfo, ObjectBuilderOptions } from '../../contracts';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { EnvironmentService } from '../environment.service';
import { TextRenderingService } from './text-rendering.service';

const TABLE_PARTS = {
  bottom: '─',
  bottom_left: '└',
  bottom_mid: '┴',
  bottom_right: '┘',
  left: '│',
  left_mid: '├',
  mid: '─',
  mid_mid: '┼',
  middle: '│',
  right: '│',
  right_mid: '┤',
  top: '─',
  top_left: '┌',
  top_mid: '┬',
  top_right: '┐',
};
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

  private activeOptions: ObjectBuilderOptions;
  private columns: ColumnInfo[];
  private selectedCell: number;
  private selectedRow: number;
  private values: Record<string, unknown>[];

  public renderTable(
    options: ObjectBuilderOptions,
    selectedRow: number,
    selectedCell: number,
  ): string {
    this.selectedCell = selectedCell;
    this.selectedRow = selectedRow;
    this.activeOptions = options;
    if (Array.isArray(options.current)) {
      this.values = options.current;
    }
    this.values = Array.isArray(options.current)
      ? options.current
      : [options.current];
    this.calcColumns();
    const header = this.header();
    const rows = this.rows()
      .join(
        `\n` +
          [
            TABLE_PARTS.left_mid,
            this.columns
              .map((i) => TABLE_PARTS.bottom.repeat(i.maxWidth))
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
    this.columns = this.activeOptions.elements.map((item) => {
      return {
        maxWidth: Math.max(
          MIN_CELL_WIDTH,
          PADDING + item.name.length + PADDING,
          PADDING +
            ansiMaxLength(
              this.values.map((row) => {
                const value = get(row, item.path);
                if (is.date(value)) {
                  return value.toLocaleString();
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
        .map((i) => TABLE_PARTS.bottom.repeat(i.maxWidth))
        .join(TABLE_PARTS.bottom_mid),
      TABLE_PARTS.bottom_right,
    ].join('');
  }

  private header(): string[] {
    return [
      [
        TABLE_PARTS.top_left,
        this.columns
          .map((i) => TABLE_PARTS.top.repeat(i.maxWidth))
          .join(TABLE_PARTS.top_mid),
        TABLE_PARTS.top_right,
      ].join(``),
      [
        TABLE_PARTS.left,
        this.columns
          .map(
            (i) =>
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
          .map((i) => TABLE_PARTS.mid.repeat(i.maxWidth))
          .join(TABLE_PARTS.mid_mid),
        TABLE_PARTS.right_mid,
      ].join(''),
    ];
  }

  private highlight(lines: string[]): string[] {
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
    return chalk.cyan.inverse(char);
  }

  private rows(): string[] {
    const out = this.values.map((i, rowIndex) => {
      return [
        rowIndex === this.selectedRow && this.selectedCell === START
          ? this.highlightChar(TABLE_PARTS.left)
          : TABLE_PARTS.left,
        ...this.activeOptions.elements.map((element, colIndex) => {
          const content =
            ' '.repeat(PADDING) +
            this.textRender.typePrinter(get(i, element.path));
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
