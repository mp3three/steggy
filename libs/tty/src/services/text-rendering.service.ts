import {
  ARRAY_OFFSET,
  DOWN,
  INCREMENT,
  INVERT_VALUE,
  IsEmpty,
  LABEL,
  START,
  UP,
  VALUE,
} from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import fuzzy from 'fuzzysort';

import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../includes';
import { MenuEntry } from '../inquirer';

const TEMP_TEMPLATE_SIZE = 3;
const MAX_SEARCH_SIZE = 50;
const SEPARATOR = chalk.blue.dim('|');

/**
 * Common utils for inqurirer prompt rendering
 *
 * Broken out into a nest service to allow access to configuration / other services
 */
@Injectable()
export class TextRenderingService {
  public appendHelp(
    message: string,
    base: MenuEntry[],
    app: MenuEntry[] = [],
  ): string {
    const longestLine = Math.max(
      ...message.split(`\n`).map((i) => ansiStrip(i).length),
    );
    const list = [...base, ...app];
    const max = this.biggestLabel(list);
    return [
      message,
      ``,
      ``,
      chalk.blue.dim` ${'='.repeat(longestLine)}`,
      ` `,
      ...list
        .sort(([a], [b]) => {
          if (a.length < b.length) {
            return UP;
          }
          if (b.length < a.length) {
            return DOWN;
          }
          return a > b ? UP : DOWN;
        })
        .map((i) => {
          return chalk` {blue.dim -} {yellow.dim ${i[LABEL].padEnd(
            max,
            ' ',
          )}}  {gray ${i[VALUE]}}`;
        }),
    ].join(`\n`);
  }

  public biggestLabel(entries: MenuEntry[]): number {
    return Math.max(...entries.map((i) => i[LABEL].length));
  }

  public fuzzySort(searchText: string, data: MenuEntry[]): MenuEntry[] {
    const entries = data.map((i) => ({
      label: i[LABEL],
      value: i[VALUE],
    }));
    const fuzzyResult = fuzzy.go(searchText, entries, { key: 'label' });
    const highlighted = fuzzyResult.map((result) => {
      const { target } = result;
      const item = data.find((option) => {
        return typeof option === 'string'
          ? option === target
          : option[LABEL] === target;
      });
      return [this.highlight(result), item[VALUE]] as MenuEntry;
    });
    return highlighted;
  }

  public mergeLines(
    a: string[],
    b: string[],
    [left, right]: [string, string] = ['', ''],
  ): string[] {
    const out = [...a];
    left = left ? ' ' + left : left;
    const maxA = ansiMaxLength([...a, left]) + ARRAY_OFFSET;
    const maxB = ansiMaxLength([...b, right]);
    b.forEach((item, index) => {
      const current = ansiPadEnd(out[index] ?? '', maxA);
      item = ansiPadEnd(item, maxB);
      out[index] = chalk`${current}${SEPARATOR}${item}`;
    });
    if (a.length > b.length) {
      out.forEach(
        (line, index) =>
          (out[index] =
            index < b.length ? line : ansiPadEnd(line, maxA) + SEPARATOR),
      );
    }
    if (!IsEmpty(left)) {
      out.unshift(
        chalk`{blue.bold ${left.padStart(
          maxA - ARRAY_OFFSET,
          ' ',
        )}} {blue.dim |} {blue.bold ${right.padEnd(maxB, ' ')}}`,
      );
    }
    return out;
  }

  public searchBox(searchText: string): string[] {
    const text = IsEmpty(searchText)
      ? chalk.bgBlue`Type to filter`
      : searchText;
    return [
      chalk` {green >} {cyan Search} `,
      chalk[IsEmpty(searchText) ? 'bgBlue' : 'bgWhite'].black` ${ansiPadEnd(
        text,
        MAX_SEARCH_SIZE,
      )} `,
      ` `,
    ];
  }

  private highlight(result) {
    const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
    const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
    let highlighted = '';
    let matchesIndex = 0;
    let opened = false;
    const { target, indexes } = result;
    for (let i = START; i < target.length; i++) {
      const char = target[i];
      if (indexes[matchesIndex] === i) {
        matchesIndex++;
        if (!opened) {
          opened = true;
          highlighted += open;
        }
        if (matchesIndex === indexes.length) {
          highlighted += char + close + target.slice(i + INCREMENT);
          break;
        }
        highlighted += char;
        continue;
      }
      if (opened) {
        opened = false;
        highlighted += close;
      }
      highlighted += char;
    }
    return highlighted.replace(
      new RegExp(`${open}(.*?)${close}`, 'g'),
      (i) =>
        chalk.bgBlueBright`${i.slice(
          TEMP_TEMPLATE_SIZE,
          TEMP_TEMPLATE_SIZE * INVERT_VALUE,
        )}`,
    );
  }
}
