import { AutoLogService, InjectConfig } from '@automagical/boilerplate';
import { DOWN, is, LABEL, UP, VALUE } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';
import { PAGE_SIZE } from '../config';
import { DONE, PromptMenuItems, TableBuilderOptions } from '../contracts';
import { ListBuilderOptions, MenuComponentOptions } from './components';
import { ApplicationManagerService } from './meta';

const name = `result`;
export type PROMPT_WITH_SHORT = { name: string; short: string };
export type PromptEntry<T = string> =
  | [string | PROMPT_WITH_SHORT, string | T]
  | Separator;
const NO = 0;
const OFF_BRIGHTNESS = 0;
const MIN_BRIGHTNESS = 1;
const MAX_BRIGHTNESS = 255;
const FROM_OFFSET = 1;

@Injectable()
export class PromptService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(PAGE_SIZE) private readonly pageSize: number,
    @Inject(forwardRef(() => ApplicationManagerService))
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  /**
   * Force a user interaction before continuing
   *
   * Good for giving the user time to read a message before a screen clear happens
   */
  public async acknowledge(): Promise<void> {
    await inquirer.prompt([{ name, type: 'acknowledge' }]);
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

  public async cron(value?: string): Promise<string> {
    const { result } = await inquirer.prompt([
      {
        name,
        type: 'cron',
        value,
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

  public async dateRange(
    defaultOffset = FROM_OFFSET,
  ): Promise<{ from: Date; to: Date }> {
    const from = await this.timestamp(
      `From date`,
      dayjs().subtract(defaultOffset, 'day').toDate(),
    );
    const to = await this.timestamp('End date');
    return { from, to };
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
    if (is.empty(options)) {
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
    return items.map(item => {
      if (Array.isArray(item)) {
        const label = item[LABEL] as string | PROMPT_WITH_SHORT;
        return is.string(label)
          ? {
              // Adding emojies can sometimes cause the final character to have rendering issues
              // Insert sacraficial empty space to the end
              name: `${label} `,
              short: `${label}${extendedShort ? ' ' : ''}`,
              value: item[VALUE] as T,
            }
          : {
              ...(label as PROMPT_WITH_SHORT),
              value: item[VALUE] as T,
            };
      }
      return item;
    });
  }

  public async listBuild<T>(options: ListBuilderOptions<T>): Promise<T[]> {
    const result = await this.applicationManager.activate<
      ListBuilderOptions<T>,
      T[]
    >('list', options);
    return result;
  }

  public async menu<T extends unknown = string>(
    options: MenuComponentOptions<T | string>,
  ): Promise<T | string> {
    options.keyMap ??= {};
    options.keyMap ??= {
      d: [chalk.bold`Done`, DONE],
    };
    const result = await this.applicationManager.activate<
      MenuComponentOptions,
      T
    >('menu', options);
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

  public async objectBuilder<T>(options: TableBuilderOptions<T>): Promise<T[]> {
    const result = await this.applicationManager.activate<
      TableBuilderOptions<T>,
      T[]
    >('table', options);
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
    if (is.empty(options)) {
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
    if (is.empty(options)) {
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
