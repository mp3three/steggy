import { Injectable } from '@nestjs/common';
import {
  ARRAY_OFFSET,
  AutoLogService,
  EMPTY,
  INCREMENT,
  is,
  IsEmpty,
  PEAT,
  START,
} from '@text-based/utilities';
import chalk from 'chalk';

import { ansiMaxLength } from '..';

const GRAPH_SYMBOLS = {
  bar: '│',
  bl: '╮',
  br: '╭',
  cross: '┼',
  dash: '─',
  left_dash: '╴',
  right_dash: '╶',
  right_join: '┤',
  tl: '╯',
  tr: '╰',
};
const RATIO_MIN = 0;
const RATIO_MAX = 1;
const NEXT = 1;
const FRACTION_DIGITS = 2;
const LABELS = 1;
const DEFAULT_OFFSET = 3;
const DEFAULT_PADDING = '           ';

type formatter = (x: number, padding: string) => string;
export class PlotOptions {
  colors?: string[];
  format?: formatter;
  height?: number;
  offset?: number;
  padding?: string;
  width?: number;
  xAxis?: string[];
}

const DEFAULT_FORMATTER = (x: number, padding: string) => {
  return (padding + x.toFixed(FRACTION_DIGITS)).slice(-padding.length);
};

@Injectable()
export class ChartingService {
  constructor(private readonly logger: AutoLogService) {}

  /**
   * Draw a simple line chart. Only the y axis has labels currently
   *
   * Original code based off the asciichart library
   */
  // Too many variables to clealy refactor smaller
  // You should see the original function though...
  // eslint-disable-next-line radar/cognitive-complexity
  public plot(
    series: number[][],
    {
      offset = DEFAULT_OFFSET,
      padding = DEFAULT_PADDING,
      height,
      colors = [],
      format = DEFAULT_FORMATTER,
      width,
      xAxis,
    }: PlotOptions = {},
  ): string {
    if (IsEmpty(series)) {
      return ``;
    }
    if (width) {
      series = series.map((line) =>
        line.length < width ? line : this.evenSelection(line, width),
      );
    }
    const absMin = Math.min(...series.flat());
    const absMax = Math.max(...series.flat());
    const range = Math.abs(Math.round(absMax - absMin));
    height ??= range;

    const ratio = range !== RATIO_MIN ? height / range : RATIO_MAX;
    const min = Math.round(absMin * ratio);
    const max = Math.round(absMax * ratio);
    const rows = Math.abs(max - min);
    width = offset + Math.max(...series.map((i) => i.length));

    // Rows and columns, labels and axis
    const graph = PEAT(rows + LABELS).map((i, index) => {
      const row = PEAT(width, ' ');
      const label = format(absMax - (index / rows) * range, padding);
      const labelIndex = Math.max(offset - label.length, EMPTY);
      row[labelIndex] = chalk.bgBlue.black(label);
      row[labelIndex + NEXT] = chalk.bgBlue.black(row[labelIndex + NEXT]);
      const axis = offset - ARRAY_OFFSET;
      row[axis] = chalk.bgBlue.black(
        index === START ? GRAPH_SYMBOLS.cross : GRAPH_SYMBOLS.right_join,
      );
      return row;
    });

    // Data
    series.forEach((line, index) => {
      const currentColor = colors[index % colors.length];
      const y0 = Math.round(line[START] * ratio) - min;
      graph[rows - y0][offset - ARRAY_OFFSET] = chalk.bgBlue.black(
        this.color(GRAPH_SYMBOLS.cross, currentColor),
      );
      line.forEach((value, x) => {
        if (!line[x + NEXT]) {
          return;
        }
        const y0 = Math.round(value * ratio) - min;
        const y1 = Math.round(line[x + NEXT] * ratio) - min;
        if (y0 == y1) {
          graph[rows - y0][x + offset] = this.color(
            GRAPH_SYMBOLS.dash,
            currentColor,
          );
          return;
        }
        graph[rows - y1][x + offset] = this.color(
          y0 > y1 ? GRAPH_SYMBOLS.tr : GRAPH_SYMBOLS.br,
          currentColor,
        );
        graph[rows - y0][x + offset] = this.color(
          y0 > y1 ? GRAPH_SYMBOLS.bl : GRAPH_SYMBOLS.tl,
          currentColor,
        );
        const from = Math.min(y0, y1);
        const to = Math.max(y0, y1);
        for (let y = from + ARRAY_OFFSET; y < to; y++) {
          graph[rows - y][x + offset] = this.color(
            GRAPH_SYMBOLS.bar,
            currentColor,
          );
        }
      });
    });
    const lines = graph.map((x) => x.join(''));
    if (xAxis) {
      const longest = ansiMaxLength(lines) - padding.length - 2;
      const headers = this.reduceHeaders(xAxis, longest);
      const baseLength = headers.join(' ').length;
      const internalPad = ''.padEnd(
        Math.floor((longest - baseLength) / (headers.length * 2 - 2)),
        ' ',
      );
      if (Math.floor(internalPad.length) > EMPTY) {
        lines.push(
          chalk.blue.bold(
            padding +
              '   ' +
              headers
                .map((header, index) => {
                  if (index !== START) {
                    header = internalPad + header;
                  }
                  if (index !== lines.length - ARRAY_OFFSET) {
                    header += internalPad;
                  }
                  return header;
                })
                .join(' '),
          ),
        );
      }
    }
    return lines.join(`\n`);
  }

  private color(symbol: string, color = 'white'): string {
    return chalk`{${color} ${symbol}}`;
  }

  private evenSelection<T>(items: T[], n: number): T[] {
    const elements = [items[START]];
    const offset = ARRAY_OFFSET - INCREMENT;
    const totalItems = items.length - offset;
    const interval = Math.floor(totalItems / (n - offset));
    for (let i = 1; i < n - ARRAY_OFFSET; i++) {
      elements.push(items[i * interval]);
    }
    elements.push(items[items.length - ARRAY_OFFSET]);
    return elements;
  }

  private reduceHeaders(header: string[], maxLength: number): string[] {
    if (header.length > 6) {
      return this.reduceHeaders(
        header.filter((item, index) => !is.even(index)),
        maxLength,
      );
    }
    return header;
  }
}
