import {
  AutomagicalBooleanConfig,
  AutomagicalNumberConfig,
  AutomagicalPasswordConfig,
  AutomagicalRecordConfig,
  AutomagicalStringArrayConfig,
  AutomagicalStringConfig,
  AutomagicalUrlConfig,
  COMPLEX_CONFIG_PROVIDERS,
} from '@automagical/contracts';
import { AutomagicalConfig } from '@automagical/contracts/config';
import { ConfigTypeDTO } from '@automagical/utilities';
import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { get } from 'object-path';

type PromptResult<T extends unknown = unknown> = Record<'value', T>;

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
    key: string,
    config: AutomagicalBooleanConfig,
    current: boolean,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        default: this.getDefault(current, config.default),
        message: key,
        name: 'value',
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

  public async number(
    key: string,
    config: AutomagicalNumberConfig,
    current: number,
  ): Promise<PromptResult> {
    return await inquirer.prompt([
      {
        default: this.getDefault(current, config.default),
        message: key,
        name: 'value',
        type: 'number',
      },
    ]);
  }

  public async password(
    key: string,
    config: AutomagicalPasswordConfig,
    current: string,
  ): Promise<PromptResult> {
    config;
    return await inquirer.prompt([
      {
        default: current,
        message: key,
        name: 'value',
        type: 'password',
      },
    ]);
  }

  public async prompt<T extends unknown = unknown>(
    config: ConfigTypeDTO,
  ): Promise<PromptResult<T>> {
    let message = config.property;
    let current: unknown;
    if (config.library) {
      message = `${config.library}.${config.property}`;
      current = get(this.config, `libs.${message}`);
    } else {
      current = get(this.config, `application.${message}`);
    }
    switch (config.metadata.type) {
      case 'string':
        return (await this.string(
          message,
          config.metadata,
          String(current),
        )) as PromptResult<T>;
      case 'url':
        return (await this.url(
          message,
          config.metadata,
          String(current),
        )) as PromptResult<T>;
      case 'password':
        return (await this.password(
          message,
          config.metadata,
          String(current),
        )) as PromptResult<T>;
      case 'number':
        return (await this.number(
          message,
          config.metadata,
          Number(current),
        )) as PromptResult<T>;
      case 'boolean':
        return (await this.boolean(
          message,
          config.metadata,
          Boolean(current),
        )) as PromptResult<T>;
    }
    throw new InternalServerErrorException(
      `type not implemented: ${message} : ${config.metadata.type}`,
    );
    // if (this.provider.has(config.type as COMPLEX_CONFIG_PROVIDERS)) {
    //   const value = await this.provider.get(
    //     config.type as COMPLEX_CONFIG_PROVIDERS,
    //   )(config.default);
    //   return { value } as PromptResult<T>;
    // }
  }

  public async record(
    key: string,
    config: AutomagicalRecordConfig,
    current: Record<string, unknown>,
  ): Promise<PromptResult> {
    throw new NotImplementedException();
    current;
    // return await this.section(
    //   '',
    //   // `Object Builder: ${prefix}${config.key}`,
    //   async () => {
    //     // return await this.recordBuilder(config);
    //   },
    // );
  }

  public async string(
    key: string,
    config: AutomagicalStringConfig,
    current: string,
  ): Promise<PromptResult<string>> {
    if (config.enum) {
      return await inquirer.prompt([
        {
          choices: config.enum,
          default: this.getDefault(current, config.default),
          message: key,
          name: 'value',
          type: 'list',
        },
      ]);
    }
    return await inquirer.prompt([
      {
        default: this.getDefault(current, config.default),
        message: key,
        name: 'value',
        type: 'input',
      },
    ]);
  }

  public async stringArray(
    key: string,
    config: AutomagicalStringArrayConfig,
    current: string[],
  ): Promise<PromptResult<string[]>> {
    throw new NotImplementedException();
    current;
    // console.log(chalk.blueBright('?'), 'Use blank value when done');
    // const value = [];
    // let lastValue: PromptResult<string> = { value: '' };
    // do {
    //   lastValue = await this.string(key, {
    //     ...config,
    //     type: 'string',
    //   } as AutomagicalStringConfig);
    //   if (lastValue) {
    //     value.push(lastValue.value);
    //   }
    // } while (lastValue.value.length > 0);
    // return { value };
  }

  public async url(
    key: string,
    config: AutomagicalUrlConfig,
    current: string,
  ): Promise<PromptResult> {
    return await this.string(
      key,
      {
        ...config,
        type: 'string',
      },
      current,
    );
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

  private getDefault(current: unknown, defaultValue: unknown): unknown {
    // eslint-disable-next-line unicorn/no-null
    if (current === null || Number.isNaN(current)) {
      return defaultValue;
    }
    return current;
  }
}
