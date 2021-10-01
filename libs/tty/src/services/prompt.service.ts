import { AutoLogService, InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import fuzzy from 'fuzzysort';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { CANCEL, PromptMenuItems } from '..';
import { PAGE_SIZE } from '../config';

const EMPTY = 0;

@Injectable()
export class PromptService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(PAGE_SIZE) private readonly pageSize: number,
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
    prompt: string,
    options: ({ name: string; value: T } | string)[],
  ): Promise<T> {
    const { result } = await inquirer.prompt([
      {
        message: prompt,
        name: 'result',
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
    const { value } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name: 'value',
        type: confirm,
      },
    ]);
    return value;
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

  public async confirm(prompt: string, defaultValue = false): Promise<boolean> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name: 'result',
        type: 'confirm',
      },
    ]);
    return result;
  }

  public async expand<T extends unknown = string>(
    message: string,
    options: { key: string; name: string; value: T }[],
    defaultValue?: string,
  ): Promise<T> {
    if (options.length === EMPTY) {
      this.logger.warn(`No choices to pick from`);
      return undefined;
    }
    const { value } = await inquirer.prompt([
      {
        choices: options,
        default: defaultValue,
        message,
        name: 'value',
        pageSize: this.pageSize,
        type: 'expand',
      },
    ]);
    return value;
  }

  public async menuSelect(
    menu: PromptMenuItems,
    message = '',
  ): Promise<string> {
    return await this.pickOne(message, [
      ...menu,
      new inquirer.Separator(),
      {
        name: 'Cancel',
        value: CANCEL,
      },
    ]);
  }

  public async password(
    message: string,
    defaultValue?: string,
  ): Promise<string> {
    return await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name: 'value',
        type: 'password',
      },
    ]);
  }

  public async pickMany<T extends unknown = string>(
    message: string,
    options: (string | { name: string; value: T } | Separator)[],
    {
      min,
      max,
      ...extra
    }: { default?: string[]; max?: number; min?: number } = {},
  ): Promise<T[]> {
    if (options.length === EMPTY) {
      this.logger.warn(`No choices to pick from`);
      return [];
    }
    const { value } = (await inquirer.prompt([
      {
        choices: options,
        ...extra,
        message,
        name: 'value',
        pageSize: this.pageSize,
        type: 'checkbox',
      },
    ])) as { value: T[] };
    if (min && value.length < min) {
      this.logger.error(`${min} items are required, ${value.length} provided`);
      return await this.pickMany(message, options, { max, min, ...extra });
    }
    if (max && value.length > max) {
      this.logger.error(`limit ${max} items, ${value.length} provided`);
      return await this.pickMany(message, options, { max, min, ...extra });
    }
    return value;
  }

  public async pickOne<T extends unknown = string>(
    message: string,
    options: (string | { name: string; value: T } | Separator)[],
    defaultValue?: string,
  ): Promise<T> {
    if (options.length === EMPTY) {
      this.logger.warn(`No choices to pick from`);
      return undefined;
    }
    const { value } = await inquirer.prompt([
      {
        choices: options,
        default: defaultValue,
        message,
        name: 'value',
        pageSize: this.pageSize,
        type: 'rawlist',
      },
    ]);
    return value;
  }

  public async string(message: string, defaultValue?: string): Promise<string> {
    const { value } = await inquirer.prompt([
      {
        default: defaultValue,
        message,
        name: 'value',
        type: 'input',
      },
    ]);
    return value;
  }
}
