import {
  ConfigLibraryVisibility,
  DefaultConfigOptions,
} from '@formio/contracts';
import {
  AutomagicalConfig,
  CommonConfig,
  CONFIGURABLE_APPS,
  CONFIGURABLE_LIBS,
} from '@formio/contracts/config';
import { APPLICATION_LIST } from '@formio/contracts/constants';
import {
  CLIService,
  CONFIG_PROVIDERS,
  FigletFonts,
} from '@formio/contracts/terminal';
import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import { ClassConstructor, plainToClass } from 'class-transformer';
import clear from 'clear';
import Table from 'cli-table';
import figlet from 'figlet';
import ini from 'ini';
import inquirer from 'inquirer';
import { get, set } from 'object-path';
import { SystemService } from '../services';
import { MainCLIREPL } from './main-cli.repl';

type o = Record<string, string>;
type PromptResult<T extends unknown = unknown> = Record<'value', T>;
const LEVEL_MAP = {
  Common: 'available',
  Required: 'default',
  Secret: 'hidden',
} as Record<string, ConfigLibraryVisibility>;
const LEVEL_PRIORITIES: ConfigLibraryVisibility[] = [
  'default',
  'available',
  'hidden',
];
type KeyedConfig = DefaultConfigOptions & { key: string; current?: unknown };

@Injectable()
export class ConfigBuilderREPL implements CLIService {
  // #region Object Properties

  public description = [
    `Generate application customized configurations using the latest config definitions.`,
    `Ability to filter between:`,
    `  - Required`,
    `  - Common to set`,
    `  - Hidden (most helpful for debugging)`,
    ``,
    `When complete, you will have the ability to:`,
    `  - Print to screen`,
    `  - Save to file`,
    `  - Generate AWS multicontainer.zip`,
  ];
  public name = 'Config Builder';
  public provider = new Map<
    CONFIG_PROVIDERS,
    (defaultValue: unknown) => Promise<unknown>
  >();

  private CURRENT_CONFIG: AutomagicalConfig;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly cli: MainCLIREPL,
    private readonly systemService: SystemService,
  ) {
    this.cli.addScript(this);
  }

  // #endregion Constructors

  // #region Public Methods

  public async assembleConfig({
    type: application,
    level,
  }: {
    type: string;
    level: keyof typeof LEVEL_MAP;
  }): Promise<AutomagicalConfig> {
    const configOptions = this.buildConfig(application, LEVEL_MAP[level]);
    const config: AutomagicalConfig = {
      application: await this.buildApplicationConfig(application),
    };
    this.configTable(application, configOptions);
    await eachSeries(configOptions, async (item, callback) => {
      const results = await this.prompt(item, application);
      const path =
        item.library === '-' ? item.key : `libs.${item.library}.${item.key}`;
      set(config, path, results.value);
      callback();
    });
    return config;
  }

  public async buildApplicationConfig(
    application: string,
  ): Promise<Record<string, unknown>> {
    const out = {};
    if (!CONFIGURABLE_APPS.has(application)) {
      return out;
    }
    const nested = this.loadApplicationConfigData(
      {
        external: CONFIGURABLE_APPS.get(application),
      },
      application,
      'application',
    );
    this.configTable(application, nested);
    const output = {};
    await eachSeries(nested, async (item, callback) => {
      const results = await this.prompt(
        {
          ...item,
          key: `application.${item.key}`,
          current: get(this.CURRENT_CONFIG, `application.${item.key}`),
        },
        application,
        '',
      );
      set(output, item.key, results.value);
      callback();
    });
    return output;
  }

  /**
   * Generic entrypoint for interface
   *
   * - Prompts user for library + priority
   * - Assembles a config
   * - Passes off to handler
   */
  public async exec(): Promise<void> {
    const { type, level } = (await inquirer.prompt([
      {
        choices: APPLICATION_LIST,
        message: 'Config Type',
        name: 'type',
        type: 'list',
      },
      {
        choices: Object.keys(LEVEL_MAP).sort((a, b) => {
          if (
            LEVEL_PRIORITIES.indexOf(LEVEL_MAP[a]) >
            LEVEL_PRIORITIES.indexOf(LEVEL_MAP[b])
          ) {
            return 1;
          }
          return -1;
        }),
        message: 'Show options',
        name: 'level',
        type: 'list',
      },
    ])) as { type: string; level: keyof typeof LEVEL_MAP };
    clear();
    const config = await this.assembleConfig({ level, type });
    await this.handleConfig(config, type);
  }

  /**
   * Prompt the user for what to do
   */
  public async handleConfig(
    config: AutomagicalConfig,
    application: string,
  ): Promise<void> {
    const result = (await inquirer.prompt([
      {
        choices: [
          {
            key: 'p',
            name: 'Print',
            value: 'print',
          },
          {
            key: 'd',
            name: 'Create Deployment',
            value: 'deploy',
          },
          {
            key: 's',
            name: 'Save',
            value: 'save',
          },
          new inquirer.Separator(),
          {
            key: 'x',
            name: 'Done',
            value: '',
          },
        ],
        message: 'What to do with config?',
        name: 'next',
        type: 'expand',
      },
    ])) as { next: '' | 'deploy' | 'print' | 'save' };

    switch (result.next) {
      case 'print':
        clear();
        console.log(`\n`);
        console.log(
          chalk.yellow(
            figlet.textSync('Completed Config', {
              font: FigletFonts.output,
            }),
          ),
        );
        console.log(ini.encode(config));
        return await this.handleConfig(config, application);
      case 'save':
        await this.systemService.writeConfig(application, config);
        return await this.handleConfig(config, application);

      case 'deploy':
        throw new NotImplementedException();
    }
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async onModuleInit(): Promise<void> {
    this.provider.set(CONFIG_PROVIDERS.application, async () => {
      const { application } = await inquirer.prompt([
        {
          name: 'application',
          message: 'Select an application',
          choices: APPLICATION_LIST,
          type: 'list',
        },
      ]);
      return application;
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private async arrayBuilder(config: KeyedConfig): Promise<PromptResult> {
    console.log(chalk.blueBright('?'), 'Blank value when done');
    let repeat = true;
    const value = [];
    // Tis is a loopy situation, sorry eslint
    // eslint-disable-next-line no-loops/no-loops
    while (repeat) {
      const result = await inquirer.prompt([
        {
          message: `${config.key}[]`,
          name: 'value',
          type: 'input',
        },
      ]);
      if (!result.value) {
        repeat = false;
        break;
      }
      value.push(result.value);
    }
    return {
      value,
    };
  }

  /**
   * Go through CommonConfig & all library configs to generate list of
   * advertised options for a given application.
   *
   * Output list is sorted by `priority` > `library` > `key`
   */
  private buildConfig(
    application: string,
    level: ConfigLibraryVisibility,
  ): KeyedConfig[] {
    const out: KeyedConfig[] = [];
    this.CURRENT_CONFIG = this.systemService.loadConfig(application);
    let config = plainToClass(
      CommonConfig,
      {},
      {
        groups: [application],
        strategy: 'excludeAll',
      },
    ) as unknown as Record<string, DefaultConfigOptions>;
    Object.keys(config).forEach((key) => {
      if (['application', 'libs'].includes(key)) {
        return;
      }
      out.push({ ...config[key], key, current: get(this.CURRENT_CONFIG, key) });
    });
    CONFIGURABLE_LIBS.forEach(
      (value: ClassConstructor<unknown>, key: string) => {
        out.push(
          ...this.loadApplicationConfigData(
            {
              external: value,
              library: key,
            },
            application,
          ),
        );
      },
    );
    const lte = LEVEL_PRIORITIES.indexOf(level);
    return out
      .filter((item) => {
        const priority = LEVEL_PRIORITIES.indexOf(
          item.applications[application] ?? item.applications,
        );
        return lte >= priority;
      })
      .sort((a, b) => {
        const priorityA = LEVEL_PRIORITIES.indexOf(
          a.applications[application] ?? a.applications,
        );
        const priorityB = LEVEL_PRIORITIES.indexOf(
          b.applications[application] ?? b.applications,
        );
        if (priorityA === priorityB) {
          if (a.library === b.library) {
            if (a.key > b.key) {
              return 1;
            }
            return -1;
          }
          if (a.library > b.library) {
            return 1;
          }
          return -1;
        }
        if (priorityA > priorityB) {
          return 1;
        }
        return -1;
      });
  }

  /**
   * Render a table showing all the advertised configuration options for an application.
   * Filter visiblity by level.
   *
   * Priority column is colored
   */
  private configTable(application: string, config: KeyedConfig[]): void {
    const table = new Table({
      head: ['Type', 'Library', 'Name', 'Type', 'Default'],
    });
    config.forEach((configOptions) => {
      table.push([
        this.typeTag(
          configOptions.applications[application] ?? configOptions.applications,
        ),
        configOptions.library,
        chalk.bold(configOptions.key),
        configOptions.type,
        configOptions.default ?? '',
      ]);
    });
    console.log(table.toString());
  }

  private loadApplicationConfigData(
    { external, library }: Pick<KeyedConfig, 'external' | 'library'>,
    application: string,
    prefix?: string,
  ): KeyedConfig[] {
    const out = [];
    prefix ??= `libs.${library}`;
    const prompts = plainToClass(
      external,
      {},
      {
        groups: [application],
        strategy: 'excludeAll',
      },
    ) as unknown as Record<string, DefaultConfigOptions>;
    const keys = Object.keys(prompts);
    keys.forEach((key) => {
      out.push({
        ...prompts[key],
        key,
        current: get(this.CURRENT_CONFIG, `${prefix}.${key}`),
      });
    });
    return out;
  }

  private async prompt(
    config: KeyedConfig,
    application: string,
    prefix?: string,
  ): Promise<PromptResult> {
    if (config.provider) {
      return {
        value: await this.provider.get(config.provider)(
          config.current ?? config.default,
        ),
      };
    }
    console.log(prefix);
    prefix ??= `libs.${config.library}`;
    console.log(prefix);
    switch (config.type) {
      case 'external':
        return await this.section(
          chalk`External Config: {magenta ${config.key}}`,
          async () => {
            return await this.runExternal(config, application);
          },
        );
      case 'string':
      case 'url':
        return await inquirer.prompt([
          {
            default: config.current ?? config.default,
            message: config.key,
            name: 'value',
            prefix,
            type: 'input',
          },
        ]);
      case 'password':
        return await inquirer.prompt([
          {
            default: config.current ?? config.default,
            message: config.key,
            name: 'value',
            prefix,
            type: 'password',
          },
        ]);
      case 'number':
        return await inquirer.prompt([
          {
            default: config.current ?? config.default,
            message: config.key,
            name: 'value',
            prefix,
            type: 'number',
          },
        ]);
      case 'boolean':
        return await inquirer.prompt([
          {
            choices: config.enum,
            default: config.current ?? config.default,
            message: config.key,
            name: 'value',
            prefix,
            type: 'confirm',
          },
        ]);
      case 'enum':
        return await inquirer.prompt([
          {
            choices: config.enum,
            default: config.current ?? config.default,
            message: config.key,
            name: 'value',
            prefix,
            type: 'enum',
          },
        ]);
      case 'record':
        prefix = prefix ? `${prefix}.` : '';
        return await this.section(
          `Object Builder: ${prefix}${config.key}`,
          async () => {
            return await this.recordBuilder({ config, application });
          },
        );
      case 'array':
        prefix = prefix ? `${prefix}.` : '';
        return await this.section(
          `Array Builder: ${prefix}${config.key}`,
          async () => {
            return await this.arrayBuilder(config);
          },
        );
    }
    throw new InternalServerErrorException(
      `type not implemented: ${config.type}`,
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
  private async recordBuilder({
    config,
    application,
    recurse,
    restore,
  }: {
    config: KeyedConfig;
    application: string;
    recurse?: boolean;
    restore?: [string, string][];
  }): Promise<PromptResult<o>> {
    restore ??= [];
    let out: PromptResult<o> = {
      value: {},
    };
    if (
      restore.length > 0 ||
      recurse ||
      (config.applications[application] ?? config.applications) === 'default'
    ) {
      const [defaultKey, defaultValue] = restore.length ? restore.shift() : [];
      const key = config.recordProvider.key
        ? await this.provider.get(config.recordProvider.key)(defaultKey)
        : await inquirer.prompt([
            {
              message: config.record?.key ?? 'key',
              name: 'key',
              type: 'input',
              default: defaultKey,
            },
          ]);
      const value = config.recordProvider.value
        ? await this.provider.get(config.recordProvider.value)(defaultValue)
        : await inquirer.prompt([
            {
              message: config.record?.value ?? 'value',
              name: 'value',
              default: defaultValue,
              type: 'input',
            },
          ]);
      out = {
        value: {
          [key]: value,
        },
      };
    }
    const { next } = restore.length
      ? { next: true }
      : await inquirer.prompt([
          {
            choices: [
              {
                key: 'y',
                name: 'Yes',
                value: true,
              },
              {
                key: 'n',
                name: 'No',
                value: false,
              },
            ],
            message: `Add ${config.what}?: `,
            name: 'next',
            type: 'expand',
          },
        ]);
    if (next) {
      out.value = {
        ...(out.value as o),
        ...(
          await this.recordBuilder({
            config,
            application,
            restore,
            recurse: true,
          })
        ).value,
      };
    }
    return out;
  }

  private async runExternal(
    config: KeyedConfig,
    application: string,
  ): Promise<PromptResult<o>> {
    const nested = this.loadApplicationConfigData(config, application);
    this.configTable(application, nested);
    const output = {};
    await eachSeries(nested, async (item, callback) => {
      const results = await this.prompt(
        {
          ...item,
          key: `${config.key}.${item.key}`,
          current: get(
            this.CURRENT_CONFIG,
            `libs.${config.library}.${config.key}.${item.key}`,
          ),
        },
        application,
      );
      set(output, item.key, results.value);
      callback();
    });
    return {
      value: output,
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

  private typeTag(type: ConfigLibraryVisibility) {
    const formatted = type[0].toUpperCase() + type.slice(1);
    switch (type) {
      case 'available':
        return chalk.bgWhite(chalk.black(formatted));
      case 'default':
        return chalk.inverse(chalk.green(formatted));
      case 'hidden':
        return chalk.inverse(chalk.magenta(formatted));
    }
  }

  // #endregion Private Methods
}
