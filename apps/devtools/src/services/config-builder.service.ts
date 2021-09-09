import {
  ConfigLibraryVisibility,
  ConfigType,
  DefaultConfigOptions,
  LIB_TERMINAL,
} from '@automagical/contracts';
import { AutomagicalConfig } from '@automagical/contracts/config';
import { iRepl } from '@automagical/contracts/tty';
import { ConfigTypeDTO } from '@automagical/contracts/utilities';
import {
  ConfigScannerService,
  OUTPUT_HEADER_FONT,
  Repl,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '@automagical/tty';
import { AutoConfigService, Trace } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import clear from 'clear';
import Table from 'cli-table';
import figlet from 'figlet';
import { existsSync } from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

import { CONFIGURABLE_MODULES } from '../includes/config-loader';

const LEVEL_MAP = {
  All: 'all',
  Required: 'required',
} as Record<string, ConfigLibraryVisibility>;
const LEVEL_PRIORITIES: ConfigLibraryVisibility[] = Object.values(
  ConfigLibraryVisibility,
);
type KeyedConfig<T extends ConfigType = ConfigType> =
  DefaultConfigOptions<T> & {
    key: string;
  };

@Repl({
  consumesConfig: [OUTPUT_HEADER_FONT],
  description: [
    `Generate application customized configurations using the latest config definitions.`,
    ``,
    `When complete, you will have the ability to:`,
    `  - Print to screen`,
    `  - Save to file`,
  ],
  name: 'Config Builder',
})
export class ConfigBuilderService implements iRepl {
  // #region Object Properties

  private systemConfigs = new Map<string, AutomagicalConfig>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly systemService: SystemService,
    private readonly typePrompt: TypePromptService,
    private readonly configService: AutoConfigService,
    private readonly configScanner: ConfigScannerService,
    private readonly workspace: WorkspaceService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Generic entrypoint for interface
   *
   * - Prompts user for library + priority
   * - Assembles a config
   * - Passes off to handler
   */
  @Trace()
  public async exec(): Promise<void> {
    const { application, level } = (await inquirer.prompt([
      {
        choices: this.applicationChoices(),
        message: 'Config Type',
        name: 'application',
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
    ])) as { application: string; level: ConfigLibraryVisibility };
    clear();
    this.typePrompt.config = rc(application.split('-')[0]);

    const module = CONFIGURABLE_MODULES.get(application.split('-')[0]);
    const { required, optional } = await this.loadDefinitions(module, level);
  }

  /**
   * Prompt the user for what to do
   */
  @Trace()
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
              font: this.configService.get<figlet.Fonts>([
                LIB_TERMINAL,
                OUTPUT_HEADER_FONT,
              ]),
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

  // #region Private Methods

  @Trace()
  private configFilterSort(
    config: KeyedConfig[],
    application: string,
    lte: number,
  ): KeyedConfig[] {
    return config
      .filter((item) => {
        if (!item.applications) {
          return false;
        }
        if (Object.keys(item.applications).length === 0) {
          return false;
        }
        const priority = LEVEL_PRIORITIES.indexOf(
          item.applications[application] ?? item.applications,
        );
        if (priority === -1) {
          return false;
        }
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

  private applicationChoices() {
    return this.workspace
      .list('application')
      .map((item) => {
        const key = item.split('-')[0];
        const tag = existsSync(join(homedir(), '.config', key))
          ? chalk.green('*')
          : chalk.yellow('*');
        const name = this.workspace.PACKAGES.get(item).displayName;
        return {
          name: `${tag} ${name}`,
          value: item,
        };
      })
      .filter(({ value }) => CONFIGURABLE_MODULES.has(value.split('-')[0]));
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
          typeof configOptions.applications === 'string'
            ? configOptions.applications
            : configOptions.applications[application],
        ),
        configOptions.library ?? '',
        chalk.bold(configOptions.key),
        configOptions.type,
        (configOptions.default ?? '').toString(),
      ]);
    });
    console.log(table.toString());
  }

  private typeTag(type: keyof typeof ConfigLibraryVisibility) {
    switch (type) {
      case 'all':
        return chalk.bgWhite(chalk.black('all'));
      case 'required':
        return chalk.inverse(chalk.red('required'));
    }
  }

  private async loadDefinitions(
    module: ClassConstructor<unknown>,
    level: ConfigLibraryVisibility,
  ): Promise<Record<'required' | 'optional', Set<ConfigTypeDTO>>> {
    const out = await this.configScanner.scan(module);
    const optional = new Set<ConfigTypeDTO>();
    const required = new Set<ConfigTypeDTO>();
    const showOptional = level === 'all';
    out.forEach((item) => {
      if (item.default === null) {
        required.add(item);
        return;
      }
      if (showOptional) {
        optional.add(item);
      }
    });

    return {
      optional,
      required,
    };
  }

  // #endregion Private Methods
}
