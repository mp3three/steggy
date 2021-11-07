import {
  DONE,
  iRepl,
  OUTPUT_HEADER_FONT,
  PromptEntry,
  PromptService,
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
  TitleCase,
} from '@automagical/utilities';
import { InternalServerErrorException } from '@nestjs/common';
import chalk from 'chalk';
import execa from 'execa';
import figlet from 'figlet';
import { existsSync } from 'fs';
import ini from 'ini';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

const ARGV_APP = 3;

@Repl({
  category: `Maintenance`,
  icon: `⚙ `,
  name: `Config Builder`,
})
export class ConfigBuilderService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly systemService: SystemService,
    private readonly typePrompt: TypePromptService,
    private readonly configService: AutoConfigService,
    private readonly workspace: WorkspaceService,
    private readonly promptService: PromptService,
  ) {}

  /**
   * Generic entrypoint for interface
   *
   * - Prompts user for library + priority
   * - Assembles a config
   * - Passes off to handler
   */

  public async exec(): Promise<void> {
    const application =
      process.argv[ARGV_APP] ||
      (await this.promptService.menuSelect(
        this.applicationChoices(),
        `Select an application`,
      ));
    if (!this.workspace.isProject(application)) {
      this.logger.error({ application }, `Invalid application`);
      throw new InternalServerErrorException();
    }
    this.typePrompt.config = rc<AutomagicalConfig>(application);
    delete this.typePrompt.config['configs'];
    delete this.typePrompt.config['config'];
    const config: AutomagicalConfig = JSON.parse(
      JSON.stringify(this.typePrompt.config),
    );

    const out = await this.scan(application);

    this.promptService.clear();
    this.promptService.scriptHeader(`Available Configs`);
    console.log(chalk`Configuring {yellow.bold ${TitleCase(application)}}`);
    console.log();
    console.log();
    const entries = await this.buildEntries(out);
    await this.promptService.pickMany(`Test`, entries);
    await this.handleConfig(config, application);
  }

  /**
   * Prompt the user for what to do
   */

  public async handleConfig(
    config: AutomagicalConfig,
    application: string,
  ): Promise<void> {
    const action = await this.promptService.menuSelect(
      [
        ['Describe', 'describe'],
        ['Save', 'save'],
      ],
      `What to do with completed configuration?`,
    );

    switch (action) {
      case DONE:
        return;

      case 'describe':
        this.promptService.clear();
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
    }
  }

  /**
   * An item can identify as "configurable" as
   */
  private applicationChoices(): PromptEntry[] {
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
        const tag = existsSync(join(homedir(), '.config', item))
          ? chalk.green('*')
          : chalk.yellow('*');
        const name = this.workspace.PACKAGES.get(item).displayName;
        return [`${tag} ${name}`, item];
      });
  }

  private buildEntries(
    config: Set<ConfigTypeDTO>,
  ): PromptEntry<ConfigTypeDTO>[] {
    let maxLibrary = 0;
    let maxDefault = 0;
    let maxProperty = 0;
    config.forEach((entry) => {
      entry.default ??= '';
      maxLibrary = Math.max(maxLibrary, entry.library.length);
      maxDefault = Math.max(maxDefault, entry.default.toString().length);
      maxProperty = Math.max(maxProperty, entry.property.toString().length);
    });
    const out: PromptEntry<ConfigTypeDTO>[] = [];
    config.forEach((entry) => {
      let property = entry.property.padEnd(maxProperty, ' ');
      if (entry.metadata.required) {
        property = chalk.redBright(property);
      } else if (entry.metadata.warnDefault) {
        property = chalk.yellowBright(property);
      }
      out.push([
        chalk`{bold ${property}} {cyan |} ${entry.library.padEnd(
          maxLibrary,
          ' ',
        )} {cyan |} ${entry.default
          .toString()
          .padEnd(maxDefault, ' ')} {cyan |} {gray ${
          entry.metadata.description
        }}`,
        entry,
      ]);
    });
    console.log(
      chalk.bold.white.bgBlue`   ${'Property'.padEnd(
        maxProperty,
        ' ',
      )}   ${'Project'.padEnd(maxLibrary, ' ')}   ${'Default Value'.padEnd(
        maxDefault,
        ' ',
      )}   Description   `,
    );
    return out;
  }

  private path(config: ConfigTypeDTO): string {
    if (config.library) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  private async scan(application: string): Promise<Set<ConfigTypeDTO>> {
    this.logger.debug(`Preparing scanner`);
    const build = execa(`npx`, [
      `nx`,
      `build`,
      application,
      `--configuration=${SCAN_CONFIG_CONFIGURATION}`,
    ]);
    build.stdout.pipe(process.stdout);
    await build;
    this.logger.debug(`Scanning`);
    const { outputPath } =
      this.workspace.workspace.projects[application].targets.build
        .configurations[SCAN_CONFIG_CONFIGURATION];
    const { stdout } = await execa(`node`, [join(outputPath, 'main.js')]);
    const config: ConfigTypeDTO[] = JSON.parse(stdout);
    return new Set(config);
  }
}
