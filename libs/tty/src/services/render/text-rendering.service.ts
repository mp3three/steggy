import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import {
  ARRAY_OFFSET,
  DOWN,
  INCREMENT,
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
import { GV, MainMenuEntry, MenuEntry } from '../../contracts';
import { ansiMaxLength, ansiPadEnd, ansiStrip } from '../../includes';

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
const [OPEN, CLOSE] = chalk.bgBlueBright.black('_').split('_');

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
    const max = ansiMaxLength(list.map(([label]) => label));
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
            GV(i)
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
        )}} {blue.dim |}{blue.bold ${right.padEnd(maxB, ' ')}}`,
      );
    }
    if (is.string(search)) {
      out.unshift(...this.searchBox(search));
    }
    return out;
  }

  // eslint-disable-next-line radar/cognitive-complexity
  public fuzzyMenuSort<T extends unknown = string>(
    searchText: string,
    data: MainMenuEntry<T>[],
  ): MainMenuEntry<T>[] {
    if (is.empty(searchText)) {
      return data;
    }
    const formatted = data.map(i => ({
      help: i.helpText,
      label: i.entry[LABEL],
      type: i.type,
      value: i,
    }));

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    const results = fuzzy.go(searchText, formatted, {
      keys: ['label', 'help', 'type'],
      scoreFn(item) {
        return Math.max(
          // ? indexes match keys
          // Matching type is important
          // Next is label
          // Finally help
          item[2] ? item[2].score - 0 : -1000,
          item[0] ? item[0].score - 250 : -1000,
          item[1] ? item[1].score - 500 : -1000,
        );
      },
    });

    return results.map(result => {
      const label = fuzzy.highlight(
        is.object(result[0]) ? result[0] : fuzzy.single(result.obj.label, ''),
        OPEN,
        CLOSE,
      );
      const help = fuzzy.highlight(
        is.object(result[1]) ? result[1] : fuzzy.single(result.obj.help, ''),
        OPEN,
        CLOSE,
      );
      const type = fuzzy.highlight(
        is.object(result[2]) ? result[2] : fuzzy.single(result.obj.type, ''),
        OPEN,
        CLOSE,
      );
      /* eslint-enable @typescript-eslint/no-magic-numbers */
      const out = {
        // ! CORRECT USAGE OF `[VALUE]` HERE
        // Don't replace
        entry: [
          label || result.obj.value.entry[LABEL],
          result.obj.value.entry[VALUE],
        ] as MenuEntry<T>,
        helpText: help || result.obj.value.helpText,
        type: type || result.obj.value.type,
      };
      return out;
    });
  }

  public fuzzySort<T extends unknown = string>(
    searchText: string,
    data: MenuEntry<T>[],
  ): MenuEntry<T>[] {
    if (is.empty(searchText)) {
      return data;
    }
    const formatted = data.map(i => ({
      label: i[LABEL],
      value: GV(i),
    }));
    return fuzzy
      .go(searchText, formatted, { all: true, key: 'label' })
      .map(
        result =>
          [
            fuzzy.highlight(result, OPEN, CLOSE),
            result.obj.value,
          ] as MenuEntry<T>,
      );
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
    const index = entries.findIndex(i => GV(i) === value);
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

  // eslint-disable-next-line radar/cognitive-complexity
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
      if (is.empty(item)) {
        return chalk.gray(`empty string`);
      }
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
      const maxKey =
        Math.max(...Object.keys(item).map(i => i.length)) + INCREMENT;
      return (
        (nested ? `\n` : '') +
        Object.keys(item)
          .sort((a, b) => (a > b ? UP : DOWN))
          .map(
            key =>
              chalk`${INDENT.repeat(nested)}{bold ${
                NESTING_LEVELS[nested]
              }${TitleCase(key).padEnd(maxKey)}} ${this.type(
                item[key],
                nested + INCREMENT,
              )}`,
          )
          .join(`\n`)
      );
    }
    return chalk.gray(JSON.stringify(item));
  }
}
