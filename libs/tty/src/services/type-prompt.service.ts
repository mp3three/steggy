import {
  COMPLEX_CONFIG_PROVIDERS,
  ConfigRecordType,
  ConfigType,
  DefaultConfigOptions,
} from '@automagical/contracts';
import { AutomagicalConfig } from '@automagical/contracts/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { get } from 'object-path';

type PromptResult<T extends unknown = unknown> = Record<'value', T>;
type KeyedConfig<T extends ConfigType = ConfigType> =
  DefaultConfigOptions<T> & {
    key?: string;
  };

@Injectable()
export class TypePromptService {
  /**
   * Reference configuration for prompts
   *
   * Intended to be modifed by the consuming class
   */
  public config: AutomagicalConfig = {};
  public provider = new Map<
    COMPLEX_CONFIG_PROVIDERS,
    (defaultValue: unknown) => Promise<unknown>
  >();

  public async boolean(
    config: KeyedConfig<'boolean'>,
    prefix: string,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        default: get(this.config, config.key) ?? config.default,
        message: config.title ?? config.key,
        name: 'value',
        prefix,
        type: 'confirm',
      },
    ]);
  }

  public async confirm(prompt: string, defaultValue = false): Promise<boolean> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name: 'result',
        prefix: chalk.yellow('warning'),
        type: 'confirm',
      },
    ]);
    return result;
  }

  public async enum(
    config: KeyedConfig<string[]>,
    prefix: string,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        choices: config.type,
        default: get(this.config, config.key) ?? config.default,
        message: config.title ?? config.key,
        name: 'value',
        prefix,
        type: 'list',
      },
    ]);
  }

  public async number(
    config: KeyedConfig<'number'>,
    prefix: string,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        default: get(this.config, config.key) ?? config.default,
        message: config.title ?? config.key,
        name: 'value',
        prefix,
        type: 'number',
      },
    ]);
  }

  public async password(
    config: KeyedConfig<'password'>,
    prefix: string,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        default: get(this.config, config.key) ?? config.default,
        message: config.title ?? config.key,
        name: 'value',
        prefix,
        type: 'password',
      },
    ]);
  }

  public async prompt<T extends unknown = unknown>(
    config: KeyedConfig,
    prefix?: string,
  ): Promise<PromptResult<T>> {
    switch (config.type) {
      case 'string':
        return (await this.string(
          config as KeyedConfig<'string'>,
          prefix,
        )) as PromptResult<T>;
      case 'url':
        return (await this.url(
          config as KeyedConfig<'url'>,
          prefix,
        )) as PromptResult<T>;
      case 'password':
        return (await this.password(
          config as KeyedConfig<'password'>,
          prefix,
        )) as PromptResult<T>;
      case 'number':
        return (await this.number(
          config as KeyedConfig<'number'>,
          prefix,
        )) as PromptResult<T>;
      case 'boolean':
        return (await this.boolean(
          config as KeyedConfig<'boolean'>,
          prefix,
        )) as PromptResult<T>;
    }
    if (Array.isArray(config.type)) {
      return (await this.enum(
        config as KeyedConfig<string[]>,
        prefix,
      )) as PromptResult<T>;
    }
    if (this.provider.has(config.type as COMPLEX_CONFIG_PROVIDERS)) {
      const value = await this.provider.get(
        config.type as COMPLEX_CONFIG_PROVIDERS,
      )(config.default);
      return { value } as PromptResult<T>;
    }
    throw new InternalServerErrorException(
      `type not implemented: ${config.type}`,
    );
  }

  public async record(
    config: KeyedConfig<ConfigRecordType>,
    prefix: string,
  ): Promise<PromptResult> {
    prefix = prefix ? `${prefix}.` : '';
    return await this.section(
      `Object Builder: ${prefix}${config.key}`,
      async () => {
        return await this.recordBuilder(config);
      },
    );
  }

  public async string(
    config: KeyedConfig<'string'>,
    prefix: string,
  ): Promise<PromptResult<string>> {
    return await inquirer.prompt([
      {
        default: get(this.config, config.key) ?? config.default,
        message: config.title ?? config.key,
        name: 'value',
        prefix,
        type: 'input',
      },
    ]);
  }

  public async stringArray(
    config: KeyedConfig<'string[]'>,
    prefix: string,
  ): Promise<PromptResult<string[]>> {
    console.log(chalk.blueBright('?'), 'Use blank value when done');
    const value = [];
    let lastValue: PromptResult<string> = { value: '' };
    do {
      lastValue = await this.string(
        {
          ...config,
          type: 'string',
        } as KeyedConfig<'string'>,
        prefix,
      );
      if (lastValue) {
        value.push(lastValue.value);
      }
    } while (lastValue.value.length > 0);
    return { value };
  }

  public async url(
    config: KeyedConfig<'url'>,
    prefix: string,
  ): Promise<PromptResult> {
    return await this.string(
      // Temp override
      config as unknown as KeyedConfig<'string'>,
      prefix,
    );
  }

  /**
   * Assemble an object using key / value pairs
   *
   * - If a default property on the application config, function will require at least one item
   * - User is prompted for if they wish to add another after each prompt
   * - Prints final object when user finally selects no
   * - Wraps entire section visually with <Object Builder> lines
   */
  private async recordBuilder<T extends unknown = unknown>(
    config: KeyedConfig<ConfigRecordType>,
  ): Promise<PromptResult<Record<string, T>>> {
    console.log(chalk.blueBright('?'), 'Use blank key when done');
    const values: [string, T][] = [];
    const { key, value } = config.type;
    let repeat = true;
    do {
      const keyResult = await this.prompt<string>({
        ...key,
        applications: config.applications,
      });
      if (keyResult.value.length > 0) {
        repeat = false;
        break;
      }
      const valueResult = await this.prompt<T>({
        ...value,
        applications: config.applications,
      });
      values.push([keyResult.value, valueResult.value]);
    } while (repeat);
    return {
      value: Object.fromEntries(values),
    };
  }

  private async section<T extends unknown = unknown>(
    name: string,
    callback: () => Promise<PromptResult<T>>,
  ): Promise<PromptResult<T>> {
    console.log(chalk.inverse(`\n\n<${name}>\n`));
    const out = await callback();
    // console.log(chalk.inverse(chalk.yellowBright('\n Completed Section ')));
    // console.log(ini.encode(out.value));
    console.log(chalk.inverse(`</${name}>\n`));
    return out;
  }
}
