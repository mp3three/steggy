import { Injectable } from '@nestjs/common';
import { ARRAY_OFFSET, INCREMENT, is, START } from '@text-based/utilities';
import chalk from 'chalk';
import { get } from 'object-path';

import { ColumnInfo, ObjectBuilderOptions } from '../contracts';
import { ansiMaxLength, ansiPadEnd } from '../includes';
import { EnvironmentService } from './environment.service';
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
const SELECTED_TABLE_PARTS = Object.fromEntries(
  Object.entries(TABLE_PARTS).map(([a, b]) => [a, chalk.cyan(b)]),
) as Record<keyof typeof TABLE_PARTS, string>;
const PADDING = 1;
const HEADER_OFFSET = 2;
const ROW_MULTIPLIER = 2;
const HEADER_LINE_COUNT = 3;

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
    return [
      //
      ...this.header(),
      this.rows().join(
        [
          TABLE_PARTS.left_mid,
          this.columns
            .map((i) => TABLE_PARTS.bottom.repeat(i.maxWidth))
            .join(TABLE_PARTS.mid_mid),
          TABLE_PARTS.right_mid,
        ].join(''),
      ),
      this.footer(),
    ].join(`\n`);
  }

  private calcColumns(): void {
    this.columns = this.activeOptions.elements.map((item) => {
      return {
        maxWidth: Math.max(
          PADDING + item.name.length + PADDING,
          ansiMaxLength(this.values.map((row) => get(row, item.path))),
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
              chalk`${' '.repeat(PADDING)}{bold.blue ${i.name}}${' '.repeat(
                PADDING,
              )}`,
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
    return lines.map((line, index) => {
      const bottom = HEADER_LINE_COUNT + this.selectedCell * ROW_MULTIPLIER;
      const middle = bottom - ARRAY_OFFSET;
      const top = middle - ARRAY_OFFSET;
      if (![middle, top, bottom].includes(index)) {
        return line;
      }
      // const ignoreBefore =
      if (index === top) {
        return [...line]
          .map((char, index) => {
            return char;
          })
          .join('');
      }
      return line;
    });
  }

  private rows(): string[] {
    return this.values.map((i) => {
      return [
        TABLE_PARTS.left,
        ...this.activeOptions.elements.map((element, colIndex) => {
          const cell = ansiPadEnd(
            ' '.repeat(PADDING) +
              this.textRender.typePrinter(get(i, element.path)),
            this.columns[colIndex].maxWidth,
          );
          return (
            cell +
            (colIndex === this.columns.length - ARRAY_OFFSET
              ? TABLE_PARTS.right
              : TABLE_PARTS.middle)
          );
        }),
      ].join('');
    });
  }
}
