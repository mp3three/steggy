import {
  iRepl,
  OUTPUT_HEADER_FONT,
  Repl,
  SCAN_CONFIG_CONFIGURATION,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '@automagical/tty';
import {
  AutoConfigService,
  AutoLogService,
  AutomagicalConfig,
  ConfigTypeDTO,
  LIB_TERMINAL,
  Trace,
} from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import clear from 'clear';
import execa from 'execa';
import figlet from 'figlet';
import { existsSync } from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import { set } from 'object-path';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

@Repl({
  description: [
    `Generate application customized configurations using the latest config definitions.`,
    ``,
    `When complete, you will have the ability to:`,
    `  - Print to screen`,
    `  - Save to file`,
  ],
  name: '🔧 Config Builder',
})
export class ConfigBuilderService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly systemService: SystemService,
    private readonly typePrompt: TypePromptService,
    private readonly configService: AutoConfigService,
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
    ])) as { application: string };
    this.typePrompt.config = rc<AutomagicalConfig>(application.split('-')[0]);
    delete this.typePrompt.config['configs'];
    delete this.typePrompt.config['config'];
    const config: AutomagicalConfig = JSON.parse(
      JSON.stringify(this.typePrompt.config),
    );

    const out = await this.scan(application);
    await eachSeries(out.values(), async (item, callback) => {
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

  /**
   * An item can identify as "configurable" as
   */
  private applicationChoices() {
    return this.workspace
      .list('application')
      .filter((item) => {
        const { projects } = this.workspace.workspace;
        const { targets } = projects[item];
        const scanner =
          targets?.build?.configurations[SCAN_CONFIG_CONFIGURATION];
        return typeof scanner !== 'undefined';
      })
      .map((item) => {
        const tag = existsSync(join(homedir(), '.config', item.split('-')[0]))
          ? chalk.green('*')
          : chalk.yellow('*');
        const name = this.workspace.PACKAGES.get(item).displayName;
        return {
          name: `${tag} ${name}`,
          value: item,
        };
      });
  }

  @Trace()
  private async scan(application: string): Promise<Set<ConfigTypeDTO>> {
    this.logger.debug(`Preparing scanner`);
    const build = execa(`nx`, [
      `build`,
      application,
      `--configuration=${SCAN_CONFIG_CONFIGURATION}`,
    ]);
    // Sometimes the build can take a min
    // Getting some sort of info on the screen is helpful to verify it's not dead
    build.stdout.pipe(process.stdout);
    await build;

    this.logger.debug(`Scanning`);

    const { outputPath } =
      this.workspace.workspace.projects[application].targets.build
        .configurations[SCAN_CONFIG_CONFIGURATION];
    const { stdout } = await execa(`node`, [join(outputPath, 'main.js')]);
    const config: ConfigTypeDTO[] = JSON.parse(stdout);
    return new Set<ConfigTypeDTO>(config);
  }

  private path(config: ConfigTypeDTO): string {
    if (config.library) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }
}
