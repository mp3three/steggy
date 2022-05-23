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
import { deepExtend, is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { get, set } from 'object-path';
import { exit } from 'process';

// const NO_VALUE = Symbol();
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

  private get loadedApplication() {
    return this.configDefinition.application;
  }

  public async exec() {
    this.applicationManager.setHeader(
      'App Config',
      TitleCase(this.configDefinition.application),
    );
    await this.promptService.objectBuilder({
      current: [
        { key: 'Foo 1', value: 1000 },
        { key: 'Foo 2', value: 2000 },
        { key: 'Foo 3', value: 3000 },
        { key: 'Foo 4', value: 4000 },
        { key: 'Foo 5', value: 5000 },
      ],
      elements: [
        { name: 'Key', path: 'key', type: 'string' },
        { name: 'Value', path: 'value', type: 'number' },
      ],
    });
    return;
    const action = await this.promptService.menu({
      hideSearch: true,
      right: ToMenuEntry([
        ['List config files', 'list-files'],
        ['Edit config', 'edit'],
      ]),
    });
    switch (action) {
      case 'list-files':
        this.listConfigFiles();
        this.screenService.down();
        await this.promptService.acknowledge();
        return await this.exec();
      case 'edit':
        await this.selectConfig();
        console.log(this.config);
        await this.promptService.acknowledge();
        return await this.exec();
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
      this.workspaceService.configFilePaths(this.configDefinition.application),
    );
    const mergedConfig: AbstractConfig = {};
    configs.forEach(config => deepExtend(mergedConfig, config));
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
      helpText = chalk`{blue Default Value:} {${color} ${item.metadata.default}}\n {cyan.bold > }${helpText}`;
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
    const current = get(this.config, path, config?.default);
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

  private async selectConfig(initial?: ConfigTypeDTO): Promise<void> {
    const mergedConfig = this.config;
    const item = await this.promptService.menu({
      keyMap: { d: [chalk.bold`Done`, DONE] },
      right: this.configDefinition.config.map(item => {
        const prefix =
          this.configDefinition.application === item.library
            ? 'application'
            : `libs.${item.library}`;
        let currentValue = get(
          mergedConfig,
          `${prefix}.${item.property}`,
        ) as unknown;
        switch (item.metadata.type) {
          case 'number':
            // currentValue = Number(currentValue);
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
        return this.buildMenuEntry(item, currentValue);
      }),
      value: initial,
    });
    if (is.string(item)) {
      return;
    }
    await this.editConfig(item);
    return await this.selectConfig(item);
  }
}
