import {
  DONE,
  iRepl,
  OUTPUT_HEADER_FONT,
  PromptEntry,
  PromptService,
  Repl,
  SCAN_CONFIG_CONFIGURATION,
  SetiIcons,
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
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';
import execa from 'execa';
import figlet from 'figlet';
import { existsSync } from 'fs';
import ini from 'ini';
import { set } from 'object-path';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

@Repl({
  category: `Maintenance`,
  icon: SetiIcons.config,
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
  @Trace()
  public async exec(): Promise<void> {
    const application = await this.promptService.menuSelect(
      this.applicationChoices(),
    );
    this.typePrompt.config = rc<AutomagicalConfig>(application);
    delete this.typePrompt.config['configs'];
    delete this.typePrompt.config['config'];
    const config: AutomagicalConfig = JSON.parse(
      JSON.stringify(this.typePrompt.config),
    );

    const out = await this.scan(application);
    const table = new Table({
      head: [
        'Flags',
        'Library',
        'Property',
        `Type`,
        // 'Description',
        'Default Value',
      ],
    });
    out.forEach((row) => {
      const flags: string[] = [];
      if (row.metadata.required) {
        flags.push(chalk.red(`REQUIRED`));
      }
      if (row.metadata.warnDefault) {
        flags.push(chalk.yellow(`RECOMMENDED`));
      }
      table.push([
        flags.join(`\n`),
        row.library || '',
        row.property || '',
        row.metadata?.type || '',
        // row.metadata?.description || '',
        // '',
        row.metadata?.default || '',
      ]);
    });
    console.log(table.toString());
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
    const action = await this.promptService.menuSelect([
      ['Describe', 'describe'],
      ['Save', 'save'],
    ]);

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

  private path(config: ConfigTypeDTO): string {
    if (config.library) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  @Trace()
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
    return new Set<ConfigTypeDTO>(config);
  }
}
