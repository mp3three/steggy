import {
  DONE,
  iRepl,
  PromptEntry,
  PromptService,
  Repl,
  SCAN_CONFIG_CONFIGURATION,
  SystemService,
  WorkspaceService,
} from '@automagical/tty';
import {
  AutoConfigService,
  AutoLogService,
  AutomagicalConfig,
  ConfigTypeDTO,
  TitleCase,
} from '@automagical/utilities';
import { InternalServerErrorException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import execa from 'execa';
import { existsSync } from 'fs';
import inquirer from 'inquirer';
import { dump } from 'js-yaml';
import { get, set } from 'object-path';
import { homedir } from 'os';
import { join } from 'path';
import rc from 'rc';

const ARGV_APP = 3;
const UP = 1;
const DATA = 1;
const DOWN = -1;
const COMMAIFY = 10_000;
const HEADER_END_PADDING = 20;
const NO_VALUE = { no: 'value' };

@Repl({
  category: `Maintenance`,
  icon: `⚙ `,
  name: `Config Builder`,
})
export class ConfigBuilderService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly systemService: SystemService,
    private readonly configService: AutoConfigService,
    private readonly workspace: WorkspaceService,
    private readonly promptService: PromptService,
  ) {}
  private config: AutomagicalConfig;

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
    await this.processApplication(application);
  }

  /**
   * Prompt the user for what to do
   */

  public async handleConfig(application: string): Promise<void> {
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
        this.promptService.print(dump(this.config));
        return await this.handleConfig(application);
      case 'save':
        await this.systemService.writeConfig(application, this.config);
        return await this.handleConfig(application);
    }
  }

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
    const build: PromptEntry<ConfigTypeDTO>[] = [];
    config.forEach((entry) => {
      build.push([
        chalk`{bold ${this.colorProperty(
          entry,
          maxProperty,
        )}} {cyan |} ${entry.library.padEnd(
          maxLibrary,
          ' ',
        )} {cyan |} ${this.colorDefault(entry, maxDefault)} {cyan |} {gray ${
          entry.metadata.description
        }}`,
        entry,
      ]);
    });
    console.log(
      [
        chalk.bold.yellow(`Property colors`),
        chalk.bold` {cyan -} {white Using default}`,
        chalk.bold` {cyan -} {red Required}`,
        chalk.bold` {cyan -} {greenBright Overridden}`,
        ``,
        chalk.bold.white.bgBlue`   ${'     Property'.padEnd(
          maxProperty,
          ' ',
        )}   ${'  Project'.padEnd(
          maxLibrary,
          ' ',
        )}   ${'    Default Value'.padEnd(
          maxDefault,
          ' ',
        )}           Description   ${''.padEnd(HEADER_END_PADDING, ' ')}`,
      ].join(`\n`),
    );
    const out: PromptEntry<ConfigTypeDTO>[] = [];
    let lastLibrary = ``;
    build
      .sort((aa, bb) => {
        const a = aa[DATA] as ConfigTypeDTO;
        const b = bb[DATA] as ConfigTypeDTO;
        if (a.library !== b.library) {
          return a.library > b.library ? UP : DOWN;
        }
        return a.property > b.property ? UP : DOWN;
      })
      .forEach((entry) => {
        const data = entry[DATA] as ConfigTypeDTO;
        if (data.library !== lastLibrary) {
          lastLibrary = data.library;
          out.push(
            new inquirer.Separator(chalk.white(TitleCase(data.library))),
          );
        }
        out.push(entry);
      });
    return out;
  }

  private colorDefault(entry: ConfigTypeDTO, max: number): string {
    const defaultValue = entry.default;
    if (typeof defaultValue === 'undefined' || defaultValue === '') {
      return chalk.gray(`none`.padEnd(max, ' '));
    }
    if (typeof defaultValue === 'number') {
      return chalk.yellowBright(
        (defaultValue > COMMAIFY
          ? defaultValue.toLocaleString()
          : defaultValue.toString()
        ).padEnd(max, ' '),
      );
    }
    if (typeof defaultValue === 'boolean') {
      return chalk.blueBright(defaultValue.toString().padEnd(max, ' '));
    }
    if (typeof defaultValue !== 'string') {
      return chalk.magentaBright(defaultValue.toString().padEnd(max, ' '));
    }
    return chalk.whiteBright(defaultValue.toString().padEnd(max, ' '));
  }

  private colorProperty(entry: ConfigTypeDTO, maxProperty: number): string {
    const property = entry.property.padEnd(maxProperty, ' ');
    const path = this.path(entry);
    const value = get(this.config, path, NO_VALUE);
    if (value !== NO_VALUE) {
      return chalk.greenBright(property);
    }
    if (entry.metadata.required) {
      return chalk.redBright(property);
    }
    if (entry.metadata.warnDefault) {
      return chalk.yellowBright(property);
    }
    return chalk.whiteBright(property);
  }

  private path(config: ConfigTypeDTO): string {
    if (config.library) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  private async processApplication(application: string): Promise<void> {
    this.config = rc<AutomagicalConfig>(application);
    delete this.config['configs'];
    delete this.config['config'];

    const configEntries = await this.scan(application);
    this.promptService.clear();
    this.promptService.scriptHeader(`Available Configs`);
    console.log(chalk`Configuring {yellow.bold ${TitleCase(application)}}`);
    console.log();
    console.log();
    const entries = await this.buildEntries(configEntries);
    const list = await this.promptService.pickMany(
      `Select properties to change\n`,
      entries,
    );
    this.promptService.clear();
    this.promptService.scriptHeader(TitleCase(application));

    await eachSeries(list, async (item) => await this.prompt(item));
    await this.handleConfig(application);
  }

  private async prompt(config: ConfigTypeDTO): Promise<void> {
    const path = this.path(config);
    const current = get(this.config, path, config.default);
    switch (config.metadata.type) {
      case 'boolean':
        set(
          this.config,
          path,
          await this.promptService.boolean(path, current as boolean),
        );
        return;
      case 'number':
        set(
          this.config,
          path,
          await this.promptService.number(path, current as number),
        );
        return;
      case 'password':
        set(
          this.config,
          path,
          await this.promptService.password(path, current as string),
        );
        return;
      case 'url':
      case 'string':
        set(
          this.config,
          path,
          await this.promptService.string(path, current as string),
        );
        return;
    }
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
