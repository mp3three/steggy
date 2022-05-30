import {
  AbstractConfig,
  ConfigDefinitionDTO,
  ConfigTypeDTO,
  InjectConfig,
  iQuickScript,
  QuickScript,
  StringConfig,
  WorkspaceService,
} from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  DONE,
  FontAwesomeIcons,
  MainMenuEntry,
  PromptService,
  ScreenService,
  SyncLoggerService,
  ToMenuEntry,
  TTYModule,
} from '@steggy/tty';
import { deepExtend, FIRST, is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { encode } from 'ini';
import { dump } from 'js-yaml';
import { get, set } from 'object-path';
import { exit } from 'process';

const NO_VALUE = Symbol();
@QuickScript({
  application: Symbol('config-builder'),
  imports: [TTYModule],
})
export class ConfigScanner implements iQuickScript {
  constructor(
    private readonly logger: SyncLoggerService,
    @InjectConfig('DEFINITION_FILE') private readonly definitionFile: string,
    @InjectConfig('CONFIG_FILE')
    private readonly outputFile: string,
    private readonly workspaceService: WorkspaceService,
    private readonly screenService: ScreenService,
    private readonly promptService: PromptService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  private config: AbstractConfig;
  private configDefinition: ConfigDefinitionDTO;
  private readonly dirty = new Map<string, unknown>();
  private loadedFiles: string[] = [];

  private get loadedApplication() {
    return this.configDefinition.application;
  }

  public async exec(defaultValue = 'edit') {
    this.applicationManager.setHeader(
      'App Config',
      TitleCase(this.loadedApplication),
    );
    const entries = [
      {
        entry: ['Show loaded config', 'print'],
        helpText: `Print the loaded configuration`,
      },
      {
        entry: ['List config files', 'list-files'],
        helpText:
          'List all file locations that the script may look for a configuration file at',
      },
      {
        entry: [`Edit configuration`, 'edit'],
        helpText: `Change the value of configuration items`,
      },
      {
        entry: ['Write to local file', 'write-local'],
        helpText: `Save config to a user config file`,
      },
      {
        entry: ['Output environment variables', 'environment'],
        helpText:
          'Output config as environment variables suitable for docker containers',
      },
    ] as MainMenuEntry[];
    if (!is.empty(this.outputFile)) {
      entries.push({
        entry: ['Write to config file', 'write-config'],
        helpText: chalk`Write to file {bold.cyan ${this.outputFile}}`,
      });
    }
    const action = await this.promptService.menu({
      hideSearch: true,
      keyMap: { d: ['Done', 'done'] },
      right: entries,
      sort: false,
      value: defaultValue,
    });
    switch (action) {
      case 'done':
        return;
      case 'print':
        this.screenService.print(this.config);
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'list-files':
        this.listConfigFiles();
        this.screenService.down();
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'edit':
        await this.selectConfig();
        return await this.exec(action);
      case 'environment':
        this.printEnvironment();
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'write-local':
        await this.writeLocal();
        await this.promptService.acknowledge();
        return await this.exec(action);
      case 'write-config':
        this.writeConfig();
        await this.promptService.acknowledge();
        return await this.exec(action);
    }
  }

  public onModuleInit() {
    if (is.empty(this.definitionFile)) {
      this.logger.error(`[DEFINITION_FILE] not provided`);
      exit();
    }
    if (!existsSync(this.definitionFile)) {
      this.logger.error(
        `[DEFINITION_FILE] {${this.definitionFile}} does not exist`,
      );
      exit();
    }
    this.configDefinition = JSON.parse(
      readFileSync(this.definitionFile, 'utf8'),
    );

    const [configs] = this.workspaceService.loadMergedConfig(
      this.workspaceService.configFilePaths(this.loadedApplication),
    );
    const mergedConfig: AbstractConfig = {};
    configs.forEach(config => deepExtend(mergedConfig, config));
    this.loadedFiles = [...configs.keys()];
    this.config = mergedConfig;
  }

  private buildMenuEntry(
    item: ConfigTypeDTO,
    currentValue: unknown,
  ): MainMenuEntry<ConfigTypeDTO> {
    let helpText = item.metadata.description;
    if (item.metadata.default) {
      const color =
        {
          boolean: 'green',
          internal: 'magenta',
          number: 'yellow',
        }[item.metadata.type] ?? 'white';
      const defaultValue = is.object(item.metadata.default)
        ? JSON.stringify(item.metadata.default, undefined, '  ')
        : item.metadata.default;
      helpText = [
        chalk`{blue Default Value:} {${color} ${defaultValue}}`,
        // ...item
        chalk` {cyan.bold > }${helpText}`,
      ].join(`\n`);
    }
    let color = [item.metadata.default, undefined].includes(currentValue)
      ? 'white'
      : 'green.bold';
    let warnDefault = '';
    let required = '';
    if (item.metadata.warnDefault && item.metadata.default === currentValue) {
      color = 'yellow.bold';
      warnDefault = FontAwesomeIcons.warning + ' ';
    }
    if (item.metadata.required) {
      required = chalk.red`* `;
    }
    return {
      entry: [
        chalk`{${color} ${required}${warnDefault}${item.property}}`,
        item,
      ],
      helpText,
      type: TitleCase(item.library),
    };
  }

  private async editConfig(config: ConfigTypeDTO): Promise<void> {
    const path = this.path(config);
    let current = get(this.config, path, config?.metadata?.default);
    let result: unknown;
    switch (config.metadata.type) {
      case 'boolean':
        result = await this.promptService.boolean(
          config.property,
          current as boolean,
        );
        break;
      case 'number':
        result = await this.promptService.number(
          config.property,
          current as number,
        );
        break;
      case 'record':
        current = is.object(current) ? current : {};
        result = await this.promptService.objectBuilder({
          current: Object.entries(current).map(([key, value]) => ({
            key,
            value,
          })),
          elements: [
            { name: 'Key', path: 'key', type: 'string' },
            { name: 'Value', path: 'value', type: 'string' },
          ],
        });
        result = Object.fromEntries(
          (result as { key: string; value: string }[]).map(({ key, value }) => [
            key,
            value,
          ]),
        );
        break;
      case 'password':
      case 'url':
      case 'string':
        const { metadata } = config as ConfigTypeDTO<StringConfig>;
        result = Array.isArray(metadata.enum)
          ? await this.promptService.pickOne(
              config.property,
              ToMenuEntry(metadata.enum.map(i => [i, i])),
              current,
            )
          : await this.promptService.string(config.property, current as string);
        break;
      default:
        await this.promptService.acknowledge(
          chalk.red`"${config.metadata.type}" editor not supported`,
        );
    }
    // await sleep(5000);
    set(this.config, path, result);
    // Track the original value as loaded by script
    if (this.dirty.get(path) === result) {
      this.dirty.delete(path);
      return;
    }
    if (!this.dirty.has(path)) {
      this.dirty.set(path, current);
    }
  }

  private listConfigFiles(): void {
    if (is.empty(this.loadedApplication)) {
      this.logger.error(`[APPLICATION] not provided`);
      return;
    }
    const list = this.workspaceService.configFilePaths(this.loadedApplication);
    this.applicationManager.setHeader('Config Files');
    this.screenService.print(
      chalk`Potential configuration files for {blue.bold ${this.loadedApplication}}`,
    );
    list.forEach(item =>
      this.screenService.print(
        chalk`  {${existsSync(item) ? 'green' : 'red'} ${item}}`,
      ),
    );
    this.screenService.print(
      `\nAt runtime, final configuration values are resolved using these priorities:`,
    );
    this.screenService.print(
      chalk` {yellow -} values from developer as defaults`,
    );
    this.screenService.print(
      chalk` {yellow -} values from files (loaded in descending order and merged)`,
    );
    this.screenService.print(
      chalk` {yellow -} values from environment variables`,
    );
    this.screenService.print(
      chalk` {yellow -} values from command line switches`,
    );
  }

  private path(config: ConfigTypeDTO): string {
    if (
      !is.empty(config.library) &&
      config.library !== this.loadedApplication
    ) {
      return `libs.${config.library}.${config.property}`;
    }
    return `application.${config.property}`;
  }

  /**
   * Dump as environment variables appropriate for docker containers
   */
  private printEnvironment(): void {
    const environment: string[] = [];
    this.configDefinition.config.forEach(config => {
      const path = this.path(config);
      let value: unknown = get(this.config, path, NO_VALUE);
      if (value === NO_VALUE || value === config.metadata.default) {
        return;
      }
      if (!is.string(value)) {
        value = is.object(value) ? JSON.stringify(value) : String(value);
      }
      environment.push(`${config.property}=${value}`);
    });
    this.screenService.down();
    if (is.empty(environment)) {
      this.screenService.print(chalk`  {yellow No variables to provide}`);
      this.screenService.down();
      return;
    }
    this.screenService.print(environment.join(`\n`));
    this.screenService.down();
  }

  /**
   * Build a fancy menu prompt to display all the configuration options grouped by project
   */
  private async selectConfig(initial?: ConfigTypeDTO): Promise<void> {
    const mergedConfig = this.config;
    const item = await this.promptService.menu({
      keyMap: { d: [chalk.bold`Done`, DONE] },
      right: this.configDefinition.config.map(item => {
        const prefix =
          this.loadedApplication === item.library
            ? 'application'
            : `libs.${item.library}`;
        let currentValue = get(
          mergedConfig,
          `${prefix}.${item.property}`,
        ) as unknown;
        if (!is.undefined(currentValue)) {
          switch (item.metadata.type) {
            case 'number':
              currentValue = Number(currentValue);
              break;
            case 'boolean':
              if (is.string(currentValue)) {
                currentValue = ['false', 'n'].includes(
                  currentValue.toLowerCase(),
                );
                break;
              }
              currentValue = Boolean(currentValue);
          }
        }
        return this.buildMenuEntry(item, currentValue);
      }),
      value: initial,
    });
    if (is.string(item)) {
      return;
    }
    await this.editConfig(item);
    // re-re-recursion!
    return await this.selectConfig(item);
  }

  private writeConfig(target = this.outputFile): void {
    const environment: AbstractConfig = {};
    this.configDefinition.config.forEach(config => {
      const path = this.path(config);
      const value: unknown = get(this.config, path, NO_VALUE);
      if (value === NO_VALUE || value === config.metadata.default) {
        return;
      }
      set(environment, this.path(config), value);
    });
    const extension = target.split('.').pop().toLowerCase();
    let contents: string;
    switch (extension) {
      case 'json':
        contents = JSON.stringify(environment, undefined, '  ');
        break;
      case 'yaml':
      case 'yml':
        contents = dump(environment);
        break;
      default:
        contents = encode(environment);
    }
    writeFileSync(target, contents);
  }

  private async writeLocal(): Promise<void> {
    const list = this.workspaceService.configFilePaths(this.loadedApplication);
    const defaultValue =
      this.loadedFiles[FIRST] ?? list.find(path => path.includes('.config'));
    const target = await this.promptService.menu({
      right: ToMenuEntry(list.map(item => [item, item])),
      value: defaultValue,
    });
    this.writeConfig(target);
  }
}
