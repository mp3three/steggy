import {
  AutoLogService,
  DOWN,
  InjectConfig,
  IsEmpty,
  LABEL,
  PEAT,
  START,
  TitleCase,
  UP,
  VALUE,
} from '@for-science/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';
import fuzzy from 'fuzzysort';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import {
  BLOCK_PRINT_BG,
  BLOCK_PRINT_FG,
  DEFAULT_HEADER_FONT,
  DISABLE_CLEAR,
  PAGE_SIZE,
  SECONDARY_HEADER_FONT,
} from '../config';
import { DONE, PromptMenuItems } from '../contracts';
import { MainMenuOptions } from '../inquirer';

const name = `result`;
export type PROMPT_WITH_SHORT = { name: string; short: string };
export type PromptEntry<T = string> =
  | [string | PROMPT_WITH_SHORT, string | T]
  | Separator;
const NO = 0;
const OFF_BRIGHTNESS = 0;
const MIN_BRIGHTNESS = 1;
const BLOCK_OFFSET = '   ';
const MAX_BRIGHTNESS = 255;
const MAX_STRING_LENGTH = 300;

@Injectable()
export class PromptService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(BLOCK_PRINT_BG) private readonly blockPrintBg: string,
    @InjectConfig(BLOCK_PRINT_FG) private readonly blockPrintFg: string,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: Fonts,
    @InjectConfig(DISABLE_CLEAR) private readonly disableClear: boolean,
    @InjectConfig(PAGE_SIZE) private readonly pageSize: number,
    @InjectConfig(SECONDARY_HEADER_FONT) private readonly secondaryFont: Fonts,
  ) {}

  /**
   * Force a user interaction before continuing
   *
   * Good for giving the user time to read a message before a screen clear happens
   */
  public async acknowledge(): Promise<void> {
    await inquirer.prompt([{ name, type: 'acknowledge' }]);
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
        type: 'confirm',
      },
    ]);
    return result;
  }

  public async brightness(
    current = MAX_BRIGHTNESS,
    message = 'Brightness',
  ): Promise<number> {
    const { result } = await inquirer.prompt([
      {
        default: current,
        message: `${message} (1-255)`,
        name,
        type: 'number',
        validate(input = OFF_BRIGHTNESS) {
          return input >= MIN_BRIGHTNESS && input <= MAX_BRIGHTNESS;
        },
      },
    ]);
    return result;
  }

  /**
   * - tmux: this shoves text to top then clears (history is preserved)
   * - konsole: this just moves draw to T/L, and clears screen (on-screen history/content is lost)
   */
  public clear(): void {
    if (this.disableClear) {
      console.log(chalk.bgBlue.whiteBright`clear();`);
      return;
    }
    // Reset draw to top
    process.stdout.write('\u001B[0f');
    // Clear screen
    process.stdout.write('\u001B[2J');
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
    return result.trim();
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

  /**
   * Canned question, gets asked so often
   */
  public async friendlyName(current?: string): Promise<string> {
    return await this.string(`Friendly name`, current);
  }

  public async insertPosition<T extends unknown = string>(
    choices: PromptEntry<T>[],
    moveItem: T,
  ): Promise<number> {
    const { result } = await inquirer.prompt([
      {
        choices,
        message: 'Where add line?',
        moveValue: moveItem,
        name,
        type: 'selectLine',
      },
    ]);
    return result;
  }

  public itemsFromEntries<T extends unknown = string>(
    items: PromptEntry<T>[],
    extendedShort = false,
  ): PromptMenuItems<T> {
    return items.map((item) => {
      if (Array.isArray(item)) {
        const label = item[LABEL] as string | PROMPT_WITH_SHORT;
        return typeof label === 'string'
          ? {
              // Adding emojies can sometimes cause the final character to have rendering issues
              // Insert sacraficial empty space to the end
              name: `${label} `,
              short: `${label}${extendedShort ? ' ' : ''}`,
              value: item[VALUE] as T,
            }
          : {
              ...label,
              value: item[VALUE] as T,
            };
      }
      return item;
    });
  }

  public async menu<T extends unknown = string>(
    options: MainMenuOptions<T | string>,
  ): Promise<T | string> {
    options.keyMap ??= {};
    options.keyMap ??= {
      d: [chalk.bold`Done`, DONE],
    };
    const { result } = await inquirer.prompt([
      {
        ...options,
        name,
        type: 'mainMenu',
      } as MainMenuOptions<T>,
    ]);
    return result;
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

  public objectPrinter(item: unknown): string {
    if (typeof item === 'undefined') {
      return ``;
    }
    if (typeof item === 'number') {
      return chalk.yellow(String(item));
    }
    if (typeof item === 'boolean') {
      return chalk.magenta(String(item));
    }
    if (typeof item === 'string') {
      return chalk.blue(
        item.slice(START, MAX_STRING_LENGTH) +
          (item.length > MAX_STRING_LENGTH ? chalk.blueBright`...` : ``),
      );
    }
    if (Array.isArray(item)) {
      return item.map((i) => this.objectPrinter(i)).join(`, `);
    }
    if (item === null) {
      return chalk.gray(`null`);
    }
    if (typeof item === 'object') {
      return Object.keys(item)
        .sort((a, b) => (a > b ? UP : DOWN))
        .map(
          (key) =>
            chalk`{bold ${TitleCase(key)}:} ${this.objectPrinter(item[key])}`,
        )
        .join(`\n`);
    }
    return chalk.gray(JSON.stringify(item));
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
        choices: this.itemsFromEntries(options, true),
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

  public scriptHeader(header: string, color = 'cyan'): number {
    header = figlet.textSync(header, {
      font: this.font,
    });
    this.clear();
    console.log(
      `\n`,
      chalk[color](header)
        .split(`\n`)
        .map((i) => `  ${i}`)
        .join(`\n`),
    );
    return header.split(`\n`).pop().length;
  }

  public secondaryHeader(header: string, color = 'magenta'): void {
    header = figlet.textSync(header, {
      font: this.secondaryFont,
    });
    console.log(chalk[color](header), '\n');
  }

  public sort<T>(entries: PromptEntry<T>[]): PromptEntry<T>[] {
    return entries.sort((a, b) => {
      if (!Array.isArray(a)) {
        return NO;
      }
      if (!Array.isArray(b)) {
        return NO;
      }
      return a[LABEL] > b[LABEL] ? UP : DOWN;
    });
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

  public async timeout(prompt = 'Timeout duration'): Promise<number> {
    const { result } = await inquirer.prompt([
      {
        // default: defaultValue,
        message: prompt,
        name,
        type: 'timeout',
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
