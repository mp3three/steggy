import { ConfigLibraryVisibility, LIB_TERMINAL } from '@automagical/contracts';
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
import figlet from 'figlet';
import { existsSync } from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import { set } from 'object-path';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

import { CONFIGURABLE_MODULES } from '../includes/config-loader';

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
  constructor(
    private readonly systemService: SystemService,
    private readonly typePrompt: TypePromptService,
    private readonly configService: AutoConfigService,
    private readonly configScanner: ConfigScannerService,
    private readonly workspace: WorkspaceService,
  ) {}

  /**
   * Generic entrypoint for interface
   *
   * - Prompts user for library + priority
   * - Assembles a config
   * - Passes off to handler
   */
  @Trace()
  public async exec(): Promise<void> {
    const { application } = (await inquirer.prompt([
      {
        choices: this.applicationChoices(),
        message: 'Config Type',
        name: 'application',
        type: 'list',
      },
    ])) as { application: string; level: ConfigLibraryVisibility };
    this.typePrompt.config = rc(application.split('-')[0]);
    const config: AutomagicalConfig = JSON.parse(
      JSON.stringify(this.typePrompt.config),
    );

    const module = CONFIGURABLE_MODULES.get(application.split('-')[0]);
    const { required, optional } = await this.loadDefinitions(module);

    const configuration = [...required.values(), ...optional.values()];
    await eachSeries(configuration, async (item, callback) => {
      const result = await this.typePrompt.prompt(item);
      if (result === item.metadata.default) {
        callback();
        return;
      }
      set(config, this.path(item), result.value);
      callback();
    });

    await this.handleConfig(config, application);
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
          // {
          //   key: 'd',
          //   name: 'Create Deployment',
          //   value: 'deploy',
          // },
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

  private typeTag(type: keyof typeof ConfigLibraryVisibility) {
    switch (type) {
      case 'all':
        return chalk.bgWhite(chalk.black('all'));
      case 'required':
        return chalk.inverse(chalk.red('required'));
    }
  }

  private path(config: ConfigTypeDTO): string {
    if (config.library) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  private async loadDefinitions(
    module: ClassConstructor<unknown>,
  ): Promise<Record<'required' | 'optional', Set<ConfigTypeDTO>>> {
    const out = await this.configScanner.scan(module);
    const optional = new Set<ConfigTypeDTO>();
    const required = new Set<ConfigTypeDTO>();

    out.forEach((item) => {
      if (item.default === null) {
        required.add(item);
        return;
      }
      optional.add(item);
    });

    return {
      optional,
      required,
    };
  }
}
