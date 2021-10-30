import {
  AutoLogService,
  InjectConfig,
  IsEmpty,
  PEAT,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import figlet from 'figlet';
import fuzzy from 'fuzzysort';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';
import {
  BLOCK_PRINT_BG,
  BLOCK_PRINT_FG,
  DEFAULT_HEADER_FONT,
  PAGE_SIZE,
} from '../config';
import { DONE, PromptMenuItems } from '../contracts';

const name = `result`;
export type PromptEntry<T = string> = [string, string | T] | Separator;
const LABEL = 0;
const VALUE = 1;
const BLOCK_OFFSET = '   ';

@Injectable()
export class PromptService {
  constructor(
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: figlet.Fonts,
    private readonly logger: AutoLogService,
    @InjectConfig(PAGE_SIZE) private readonly pageSize: number,
    @InjectConfig(BLOCK_PRINT_BG) private readonly blockPrintBg: string,
    @InjectConfig(BLOCK_PRINT_FG) private readonly blockPrintFg: string,
  ) {}

  /**
   * Force a user interaction before continuing
   *
   * Good for giving the user time to read a message before a screen clear happens
   */
  public async acknowledge(prompt = ''): Promise<void> {
    await this.confirm(prompt, true);
  }

  /**
   * Now featuring: FUZZYSORT!
   */
  public async autocomplete<T extends unknown = string>(
    prompt = `Pick one`,
    options: ({ name: string; value: T } | string)[],
    defaultValue?: T,
  ): Promise<T> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name,
        pageSize: this.pageSize,
        source: (answers, input) => {
          if (!input) {
            return options;
          }
          const fuzzyResult = fuzzy.go(
            input,
            options.map((item) => {
              if (typeof item === 'string') {
                return item;
              }
              return item.name;
            }),
            { limit: this.pageSize },
          );
          return fuzzyResult.map(({ target }) => {
            return options.find((option) => {
              return typeof option === 'string'
                ? option === target
                : option.name === target;
            });
          });
        },
        type: 'autocomplete',
      },
    ]);
    return result;
  }

  public async boolean(
    message: string,
    defaultValue?: boolean,
  ): Promise<boolean> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name,
        type: confirm,
      },
    ]);
    return result;
  }

  /**
   * Remove all content from the screen
   *
   * Does not clear history, so previous content is accessible by scrolling up
   */
  public clear(): void {
    process.stdout.write('\u001B[2J');
    process.stdout.write('\u001B[0f');
  }

  /**
   * For solving ternary spread casting madness more easily
   *
   * More for helping code read top to bottom more easily than solving a problem
   */
  public conditionalEntries<T extends unknown = string>(
    test: boolean,
    trueValue: PromptEntry<T>[] = [],
    falseValue: PromptEntry<T>[] = [],
  ): PromptEntry<T>[] {
    if (test) {
      return trueValue;
    }
    return falseValue;
  }

  public async confirm(
    prompt = `Are you sure?`,
    defaultValue = false,
  ): Promise<boolean> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name,
        type: 'confirm',
      },
    ]);
    return result;
  }

  public async date(
    prompt = `Date value`,
    defaultValue = new Date(),
  ): Promise<Date> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        format: {
          hour: undefined,
          minute: undefined,
          month: 'short',
        },
        message: prompt,
        name,
        type: 'date',
      },
    ]);
    return result;
  }

  public async editor(message: string, defaultValue?: string): Promise<string> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name,
        type: 'editor',
      },
    ]);

    return result;
  }

  public async expand<T extends unknown = string>(
    message: string,
    options: { key: string; name: string; value: T }[],
    defaultValue?: string,
  ): Promise<T> {
    if (IsEmpty(options)) {
      this.logger.warn(`No choices to pick from`);
      return undefined;
    }
    const { result } = await inquirer.prompt([
      {
        choices: options,
        default: defaultValue,
        message,
        name,
        pageSize: this.pageSize,
        type: 'expand',
      },
    ]);
    return result;
  }

  public header(text: string): void {
    const header = `  ${text}  `;
    const padding = ' '.repeat(header.length);
    console.log(
      [chalk.bgCyan.black([padding, header, padding].join(`\n`)), ``].join(
        `\n`,
      ),
    );
  }

  public itemsFromEntries<T extends unknown = string>(
    items: PromptEntry<T>[],
  ): PromptMenuItems<T> {
    return items.map((item) => {
      if (Array.isArray(item)) {
        return {
          name: item[LABEL] as string,
          value: item[VALUE] as T,
        };
      }
      return item;
    });
  }

  public async menuSelect<T extends unknown = string>(
    options: PromptEntry<T>[],
    message = '',
    defaultValue?: string | T,
  ): Promise<T | string> {
    return await this.pickOne<T>(
      message,
      [...options, new inquirer.Separator(), ['Done', DONE as T]],
      defaultValue,
    );
  }

  public async number(
    message = `Number value`,
    defaultValue?: number,
    { prefix, suffix }: { prefix?: string; suffix?: string } = {},
  ): Promise<number> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name,
        prefix,
        suffix,
        type: 'number',
      },
    ]);
    return result;
  }

  public async password(
    message = `Password value`,
    defaultValue?: string,
  ): Promise<string> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name,
        type: 'password',
      },
    ]);
    return result;
  }

  public async pickMany<T extends unknown = string>(
    message = `Pick many`,
    options: PromptEntry<T>[],
    {
      min,
      max,
      ...extra
    }: { default?: (string | T)[]; max?: number; min?: number } = {},
  ): Promise<T[]> {
    if (IsEmpty(options)) {
      this.logger.warn(`No choices to pick from`);
      return [];
    }
    const { result } = (await inquirer.prompt([
      {
        choices: this.itemsFromEntries(options),
        ...extra,
        message,
        name,
        pageSize: this.pageSize,
        type: 'checkbox',
      },
    ])) as { result: T[] };
    if (min && result.length < min) {
      this.logger.error(`${min} items are required, ${result.length} provided`);
      return await this.pickMany(message, options, { max, min, ...extra });
    }
    if (max && result.length > max) {
      this.logger.error(`limit ${max} items, ${result.length} provided`);
      return await this.pickMany(message, options, { max, min, ...extra });
    }
    return result;
  }

  public async pickOne<T extends unknown = string>(
    message = `Pick one`,
    options: PromptEntry<T>[],
    defaultValue?: string | T,
  ): Promise<T> {
    if (IsEmpty(options)) {
      this.logger.warn(`No choices to pick from`);
      return undefined;
    }
    const { result } = await inquirer.prompt([
      {
        choices: this.itemsFromEntries(options),
        default: defaultValue,
        message,
        name,
        pageSize: this.pageSize,
        type: 'rawlist',
      },
    ]);
    return result;
  }

  public print(data: string): void {
    const lines = data.trim().split(`\n`);
    let max = 0;
    lines.forEach((line) => (max = line.length > max ? line.length : max));
    lines.push(``);
    lines.unshift(``);
    data = lines
      .map((i) => `  ${i}${PEAT(max - i.length, ' ').join('')}  `)
      .join(`\n`);
    console.log();
    console.log(
      BLOCK_OFFSET +
        chalk
          .bgHex(this.blockPrintBg)
          .hex(this.blockPrintFg)(data)
          .replace(new RegExp(`\n`, 'g'), `\n${BLOCK_OFFSET}`),
    );
    console.log();
  }

  public scriptHeader(header: string): void {
    header = figlet.textSync(header, {
      font: this.font,
    });
    this.clear();
    console.log(chalk.cyan(header), '\n');
  }

  public async string(
    message = `String value`,
    defaultValue?: string,
    { prefix, suffix }: { prefix?: string; suffix?: string } = {},
  ): Promise<string> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name,
        prefix,
        suffix,
        type: 'input',
      },
    ]);
    return result;
  }

  public async time(
    prompt = `Time value`,
    defaultValue = new Date(),
  ): Promise<Date> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        format: {
          day: undefined,
          month: undefined,
          year: undefined,
        },
        message: prompt,
        name,
        type: 'date',
      },
    ]);
    return result;
  }

  public async timestamp(
    prompt = `Timestamp`,
    defaultValue = new Date(),
  ): Promise<Date> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name,
        type: 'date',
      },
    ]);
    return result;
  }
}
