import {
  AbstractConfig,
  ACTIVE_APPLICATION,
  AutoConfigService,
  AutoLogService,
  ConfigTypeDTO,
  DOWN,
  InjectLogger,
  is,
  SCAN_CONFIG_CONFIGURATION,
  StringConfig,
  TitleCase,
  UP,
  WorkspaceService,
} from '@text-based/utilities';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { encode } from 'ini';
import inquirer from 'inquirer';
import { get, set } from 'object-path';
import { homedir } from 'os';
import { join } from 'path';

import { DONE, ICONS, IsDone } from '../contracts';
import { ToMenuEntry } from '../inquirer';
import { PromptEntry, PromptService } from './prompt.service';

const ARGV_APP = 3;
const DATA = 1;
const COMMAIFY = 10_000;
const HEADER_END_PADDING = 20;
const NONE = 0;
const NO_VALUE = { no: 'value' };
let initialApp = process.argv[ARGV_APP];

@Injectable()
export class ConfigBuilderService {
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly activeApplication: symbol,
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly promptService: PromptService,
    private readonly configService: AutoConfigService,
  ) {}
  private config: AbstractConfig;
  private loadedApplication = '';

  /**
   * Generic entrypoint for interface
   *
   * - Prompts user for library + priority
   * - Assembles a config
   * - Passes off to handler
   */
  public async exec(): Promise<void> {
    const application =
      initialApp ||
      (await this.promptService.menu({
        keyMap: {},
        right: ToMenuEntry(this.applicationChoices()),
        rightHeader: `Application choices`,
      }));
    initialApp = undefined;
    if (!this.workspace.isProject(application)) {
      this.logger.error({ application }, `Invalid application`);
      throw new InternalServerErrorException();
    }
    await this.handleConfig(application);
  }

  /**
   * Prompt the user for what to do
   */
  public async handleConfig(
    application: string | symbol = this.activeApplication,
  ): Promise<void> {
    application = is.string(application)
      ? application
      : application.description;
    this.loadConfig(application);
    const action = await this.promptService.menu({
      keyMap: {
        d: [chalk.bold`Done`, DONE],
      },
      right: ToMenuEntry([
        [`${ICONS.EDIT}Edit`, 'edit'],
        [`${ICONS.DESCRIBE}Show`, 'describe'],
        [`${ICONS.SAVE}Save`, 'save'],
      ]),
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'edit':
        await this.buildApplication(application);
        return await this.handleConfig(application);
      case 'describe':
        this.promptService.print(encode(this.config));
        return await this.handleConfig(application);
      case 'save':
        writeFileSync(
          join(homedir(), '.config', application),
          encode(this.config),
        );
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
        return !is.undefined(scanner);
      })
      .map((item) => {
        const tag = existsSync(join(homedir(), '.config', item))
          ? chalk.green('*')
          : chalk.yellow('*');
        const name = this.workspace.PACKAGES.get(item).displayName;
        return [`${tag} ${name}`, item];
      });
  }

  private async buildApplication(application: string): Promise<void> {
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
    await eachSeries(list, async (item, callback) => {
      await this.prompt(item);
      if (callback) {
        callback();
      }
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
      entry.metadata.configurable = is.undefined(entry.metadata.configurable)
        ? true
        : entry.metadata.configurable;
      if (entry.metadata.configurable === false) {
        return;
      }
      build.push([
        {
          name: chalk`{bold ${this.colorProperty(
            entry,
            maxProperty,
          )}} {cyan |} ${entry.library.padEnd(
            maxLibrary,
            ' ',
          )} {cyan |} ${this.colorDefault(entry, maxDefault)} {cyan |} {gray ${
            entry.metadata.description
          }}`,
          short: this.colorProperty(entry, NONE),
        },
        entry,
      ]);
    });
    console.log(
      [
        chalk`{bold.yellow Property colors} - {gray Lower colors take precedence}`,
        chalk` {cyan -} {white.bold Defaults}    {cyanBright :} {white System is using default value}`,
        chalk` {cyan -} {magenta.bold Careful}     {cyanBright :} {white Don't set these unless you know what you're doing}`,
        chalk` {cyan -} {yellow.bold Recommended} {cyanBright :} {white Setting the value of this property is recommended}`,
        chalk` {cyan -} {red.bold Required}    {cyanBright :} {white Property is required, and not currently set}`,
        chalk` {cyan -} {greenBright.bold Overridden}  {cyanBright :} {white You have provided a value for this property}`,
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
    if (is.undefined(defaultValue) || defaultValue === '') {
      return chalk.gray(`none`.padEnd(max, ' '));
    }
    if (is.number(defaultValue)) {
      return chalk.yellowBright(
        (defaultValue > COMMAIFY
          ? defaultValue.toLocaleString()
          : defaultValue.toString()
        ).padEnd(max, ' '),
      );
    }
    if (is.boolean(defaultValue)) {
      return chalk.blueBright(defaultValue.toString().padEnd(max, ' '));
    }
    if (is.string(defaultValue)) {
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
    if (entry.metadata.careful) {
      return chalk.magentaBright(property);
    }
    return chalk.whiteBright(property);
  }

  private loadConfig(application: string) {
    this.config = this.configService.config;
    this.loadedApplication = application;
  }

  private path(config: ConfigTypeDTO): string {
    if (config.library && config.library !== this.loadedApplication) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  private async prompt(config: ConfigTypeDTO): Promise<void> {
    const path = this.path(config);
    const label = this.colorProperty(config, NONE);
    const current = get(this.config, path, config.default);
    let result: unknown;
    switch (config.metadata.type) {
      case 'boolean':
        result = await this.promptService.boolean(label, current as boolean);
        break;
      case 'number':
        result = await this.promptService.number(label, current as number);
        break;
      case 'password':
        result = await this.promptService.password(label, current as string);
        break;
      case 'url':
      case 'string':
        const { metadata } = config as ConfigTypeDTO<StringConfig>;
        result = Array.isArray(metadata.enum)
          ? await this.promptService.pickOne(
              label,
              metadata.enum.map((i) => [i, i]),
              current,
            )
          : await this.promptService.string(label, current as string);
        break;
    }
    if (result === config.default || result === current) {
      // Don't set defaults
      return;
    }
    set(this.config, path, result);
  }

  private async scan(application: string): Promise<Set<ConfigTypeDTO>> {
    if (!this.workspace.IS_DEVELOPMENT) {
      // Production builds ship with assembled config
      // Running in dev environment will do live scan
      const config: ConfigTypeDTO[] = JSON.parse(
        readFileSync(join(__dirname, 'assets', 'config.json'), 'utf-8'),
      );
      return new Set(config);
    }
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
    this.workspace.initMetadata();
    const { outputPath } =
      this.workspace.workspace.projects[application].targets.build
        .configurations[SCAN_CONFIG_CONFIGURATION];
    const config: ConfigTypeDTO[] = [];
    try {
      const out = await execa(`node`, [join(outputPath, 'main.js')], {});
      config.push(...(JSON.parse(out.stdout) as ConfigTypeDTO[]));
    } catch (error) {
      // FIXME: Kill signal error that sometimes shows up
      // Just ignoring the error here
      config.push(...(JSON.parse(error.stdout) as ConfigTypeDTO[]));
    }
    return new Set(config);
  }
}
