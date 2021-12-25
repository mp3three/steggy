import {
  ARRAY_OFFSET,
  AutoLogService,
  EMPTY,
  PEAT,
  START,
} from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

// const symbols = [
//  0 '┼',
//  1 '┤',
//  2 '╶',
//  3 '╴',
//  4 '─',
//  5 '╰',
//  6 '╭',
//  7  '╮',
//  8 '╯',
//  9 '│'
// ];
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
const FRACTION_DIGITS = 2;

@Injectable()
export class ChartingService {
  constructor(private readonly logger: AutoLogService) {}

  public plot(series, cfg) {
    // this function takes both one array and array of arrays
    // if an array of numbers is passed it is transformed to
    // an array of exactly one array with numbers
    if (typeof series[START] == 'number') {
      series = [series];
    }

    cfg = typeof cfg !== 'undefined' ? cfg : {};

    let min = typeof cfg.min !== 'undefined' ? cfg.min : series[START][START];
    let max = typeof cfg.max !== 'undefined' ? cfg.max : series[START][START];

    for (const element of series) {
      for (const element_ of element) {
        min = Math.min(min, element_);
        max = Math.max(max, element_);
      }
    }

    const range = Math.abs(max - min);
    const offset = typeof cfg.offset !== 'undefined' ? cfg.offset : 3;
    const padding =
      typeof cfg.padding !== 'undefined' ? cfg.padding : '           ';
    const height = typeof cfg.height !== 'undefined' ? cfg.height : range;
    const colors = typeof cfg.colors !== 'undefined' ? cfg.colors : [];
    const ratio = range !== RATIO_MIN ? height / range : RATIO_MAX;
    const min2 = Math.round(min * ratio);
    const max2 = Math.round(max * ratio);
    const rows = Math.abs(max2 - min2);
    let width = 0;
    for (const element of series) {
      width = Math.max(width, element.length);
    }
    width = width + offset;
    const format =
      typeof cfg.format !== 'undefined'
        ? cfg.format
        : function (x: number) {
            return (padding + x.toFixed(FRACTION_DIGITS)).slice(
              -padding.length,
            );
          };

    const result = PEAT(rows + ARRAY_OFFSET) as string[][]; // empty space
    for (let i = 0; i <= rows; i++) {
      result[i] = PEAT(width);
      for (let index = 0; index < width; index++) {
        result[i][index] = ' ';
      }
    }
    for (let y = min2; y <= max2; ++y) {
      // axis + labels
      const label = format(
        rows > EMPTY ? max - ((y - min2) * range) / rows : y,
        y - min2,
      );
      result[y - min2][Math.max(offset - label.length, EMPTY)] = label;
      result[y - min2][offset - ARRAY_OFFSET] =
        y === 0 ? GRAPH_SYMBOLS.cross : GRAPH_SYMBOLS.right_join;
    }

    for (const [index, element] of series.entries()) {
      const currentColor = colors[index % colors.length];
      const y0 = Math.round(element[START] * ratio) - min2;
      result[rows - y0][offset - 1] = colored(
        GRAPH_SYMBOLS.cross,
        currentColor,
      ); // first value

      for (let x = 0; x < element.length - 1; x++) {
        // plot the line
        const y0 = Math.round(element[x + 0] * ratio) - min2;
        const y1 = Math.round(element[x + 1] * ratio) - min2;
        if (y0 == y1) {
          result[rows - y0][x + offset] = colored(
            GRAPH_SYMBOLS.dash,
            currentColor,
          );
        } else {
          result[rows - y1][x + offset] = colored(
            y0 > y1 ? GRAPH_SYMBOLS.tr : GRAPH_SYMBOLS.br,
            currentColor,
          );
          result[rows - y0][x + offset] = colored(
            y0 > y1 ? GRAPH_SYMBOLS.bl : GRAPH_SYMBOLS.tl,
            currentColor,
          );
          const from = Math.min(y0, y1);
          const to = Math.max(y0, y1);
          for (let y = from + 1; y < to; y++) {
            result[rows - y][x + offset] = colored(
              GRAPH_SYMBOLS.bar,
              currentColor,
            );
          }
        }
      }
    }
    return result.map((x) => x.join('')).join('\n');
  }
}
