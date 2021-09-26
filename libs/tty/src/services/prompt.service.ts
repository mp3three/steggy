import { AutoLogService, InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { PAGE_SIZE } from '../config';

@Injectable()
export class PromptService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(PAGE_SIZE) private readonly pageSize: number,
  ) {}

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

  public clear(): void {
    process.stdout.write('\u001B[2J');
    process.stdout.write('\u001B[0f');
  }

  public async pickOne<T extends unknown = string>(
    message: string,
    options: (string | { name: string; value: T } | Separator)[],
    defaultValue?: string,
  ): Promise<T> {
    if (options.length === 0) {
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

  public async expand<T extends unknown = string>(
    message: string,
    options: { name: string; value: T; key: string }[],
    defaultValue?: string,
  ): Promise<T> {
    if (options.length === 0) {
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

  public async pickMany<T extends unknown = string>(
    message: string,
    options: (string | { name: string; value: T } | Separator)[],
    {
      min,
      max,
      ...extra
    }: { default?: string[]; min?: number; max?: number } = {},
  ): Promise<T[]> {
    if (options.length === 0) {
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
}
