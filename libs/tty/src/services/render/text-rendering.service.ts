import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import {
  ARRAY_OFFSET,
  DOWN,
  INCREMENT,
  INVERT_VALUE,
  is,
  LABEL,
  START,
  TitleCase,
  UP,
  VALUE,
} from '@steggy/utilities';
import chalk from 'chalk';
import fuzzy from 'fuzzysort';

import { PAGE_SIZE } from '../../config';
import { MenuEntry } from '../../contracts';
import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../../includes';

const TEMP_TEMPLATE_SIZE = 3;
const MAX_SEARCH_SIZE = 50;
const SEPARATOR = chalk.blue.dim('|');
const BUFFER_SIZE = 3;
const MIN_SIZE = 2;
const INDENT = '  ';
const MAX_STRING_LENGTH = 300;
const NESTING_LEVELS = [
  chalk.cyan(' - '),
  chalk.magenta(' * '),
  chalk.green(' # '),
  chalk.yellow(' > '),
  chalk.red(' ~ '),
];

/**
 * Common utils for inqurirer prompt rendering
 *
 * Broken out into a nest service to allow access to configuration / other services
 */
@Injectable()
export class TextRenderingService {
  constructor(@InjectConfig(PAGE_SIZE) private readonly pageSize: number) {}

  public appendHelp(
    message: string,
    base: MenuEntry[],
    app: MenuEntry[] = [],
  ): string {
    const longestLine = Math.max(
      ...message.split(`\n`).map(i => ansiStrip(i).length),
    );
    const list = [...base, ...app];
    const max = this.biggestLabel(list);
    return [
      message,
      ...(longestLine < MIN_SIZE
        ? []
        : [chalk.blue.dim` ${'='.repeat(longestLine)}`]),
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
        .map(i => {
          return chalk` {blue.dim -} {yellow.dim ${i[LABEL].padEnd(
            max,
            ' ',
          ).replaceAll(',', chalk.whiteBright`, `)}}  {gray ${
            i[VALUE]
            // Leave space at end for rendering reasons
          } }`;
        }),
    ].join(`\n`);
  }

  public assemble(
    leftEntries: string[],
    rightEntries: string[],
    {
      left,
      right,
      search,
    }: { left?: string; right?: string; search?: string } = {},
  ): string[] {
    const out = [...leftEntries];
    left = left ? ' ' + left : left;
    const maxA = ansiMaxLength(...leftEntries, left) + ARRAY_OFFSET;
    const maxB = ansiMaxLength(...rightEntries, right);
    rightEntries.forEach((item, index) => {
      const current = ansiPadEnd(out[index] ?? '', maxA);
      item = ansiPadEnd(item, maxB);
      out[index] = chalk`${current}${SEPARATOR}${item}`;
    });
    if (leftEntries.length > rightEntries.length) {
      out.forEach(
        (line, index) =>
          (out[index] =
            index < rightEntries.length
              ? line
              : ansiPadEnd(line, maxA) + SEPARATOR),
      );
    }
    if (!is.empty(left)) {
      out.unshift(
        chalk`{blue.bold ${left.padStart(
          maxA - ARRAY_OFFSET,
          ' ',
        )}} {blue.dim |} {blue.bold ${right.padEnd(maxB, ' ')}}`,
      );
    }
    if (is.string(search)) {
      out.unshift(...this.searchBox(search));
    }
    return out;
  }

  public biggestLabel(entries: MenuEntry[]): number {
    return Math.max(...entries.map(i => i[LABEL].length));
  }

  public fuzzySort<T extends unknown = string>(
    searchText: string,
    data: MenuEntry<T>[],
  ): MenuEntry<T>[] {
    if (is.empty(searchText)) {
      return data;
    }
    const entries = data.map(i => ({
      label: i[LABEL],
      value: i[VALUE],
    }));
    const fuzzyResult = fuzzy.go(searchText, entries, { key: 'label' });
    const highlighted = fuzzyResult.map(result => {
      const { target } = result;
      const item = data.find(option => {
        return is.string(option) ? option === target : option[LABEL] === target;
      });
      return [this.highlight(result), item[VALUE]] as MenuEntry<T>;
    });
    return highlighted;
  }

  public pad(message: string, amount = MIN_SIZE): string {
    return message
      .split(`\n`)
      .map(i => `${' '.repeat(amount)}${i}`)
      .join(`\n`);
  }

  public searchBox(searchText: string, size = MAX_SEARCH_SIZE): string[] {
    const text = is.empty(searchText)
      ? chalk.bgBlue`Type to filter`
      : searchText;
    return [
      chalk` `,
      ' ' +
        chalk[is.empty(searchText) ? 'bgBlue' : 'bgWhite'].black` ${ansiPadEnd(
          text,
          size,
        )} `,
      ` `,
    ];
  }

  public selectRange<T>(
    entries: MenuEntry<T>[],
    value: unknown,
  ): MenuEntry<T>[] {
    if (entries.length <= this.pageSize) {
      return entries;
    }
    const index = entries.findIndex(i => i[VALUE] === value);
    if (index <= BUFFER_SIZE) {
      return entries.slice(START, this.pageSize);
    }
    if (index >= entries.length - this.pageSize + BUFFER_SIZE) {
      return entries.slice(entries.length - this.pageSize);
    }
    return entries.slice(
      index - BUFFER_SIZE,
      this.pageSize + index - BUFFER_SIZE,
    );
  }

  public type(item: unknown, nested = START): string {
    if (is.undefined(item)) {
      return chalk.gray(`undefined`);
    }
    if (is.date(item)) {
      return chalk.green(item.toLocaleString());
    }
    if (is.number(item)) {
      return chalk.yellow(String(item));
    }
    if (is.boolean(item)) {
      return chalk.magenta(String(item));
    }
    if (is.string(item)) {
      return chalk.blue(
        item.slice(START, MAX_STRING_LENGTH) +
          (item.length > MAX_STRING_LENGTH ? chalk.blueBright`...` : ``),
      );
    }
    if (Array.isArray(item)) {
      return (
        `\n` +
        item
          .map(
            i =>
              INDENT.repeat(nested) +
              NESTING_LEVELS[nested] +
              this.type(i, nested + INCREMENT),
          )
          .join(`\n`)
      );
    }
    if (item === null) {
      return chalk.gray(`null`);
    }
    if (is.object(item)) {
      return (
        (nested ? `\n` : '') +
        Object.keys(item)
          .sort((a, b) => (a > b ? UP : DOWN))
          .map(
            key =>
              chalk`${INDENT.repeat(nested)}{bold ${
                NESTING_LEVELS[nested]
              }${TitleCase(key)}:} ${this.type(
                item[key],
                nested + INCREMENT,
              )}`,
          )
          .join(`\n`)
      );
    }
    return chalk.gray(JSON.stringify(item));
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
      i =>
        chalk.bgBlueBright.black`${i.slice(
          TEMP_TEMPLATE_SIZE,
          TEMP_TEMPLATE_SIZE * INVERT_VALUE,
        )}`,
    );
  }
}
