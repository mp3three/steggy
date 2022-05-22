import {
  ConfigDefinitionDTO,
  ConfigTypeDTO,
  InjectConfig,
  iQuickScript,
  QuickScript,
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
import { is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { exit } from 'process';

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

  private configDefinition: ConfigDefinitionDTO;

  public async exec() {
    this.applicationManager.setHeader('Config Builder');
    const action = await this.promptService.menu({
      hideSearch: true,
      right: ToMenuEntry([
        ['List config files', 'list-files'],
        ['Edit config', 'edit'],
      ]),
    });
    // await sleep(5000);
    switch (action) {
      case 'list-files':
        this.listConfigFiles();
        await this.promptService.acknowledge();
        return await this.exec();
      case 'edit':
        await this.editConfig();
        return await this.exec();
    }
  }

  protected onModuleInit() {
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
  }

  private async editConfig() {
    const keys = Object.keys(FontAwesomeIcons);
    const item = await this.promptService.menu({
      keyMap: { d: [chalk.bold`Done`, DONE] },
      right: this.configDefinition.config.map(
        item =>
          ({
            entry: [item.property, item],
            helpText: item.metadata.description,
            icon: FontAwesomeIcons[
              keys[Math.floor(Math.random() * keys.length)]
            ],
            type: TitleCase(item.library),
          } as MainMenuEntry<ConfigTypeDTO>),
      ),
    });
    if (is.string(item)) {
      return;
    }
    await this.promptService.acknowledge();
  }

  private listConfigFiles() {
    if (is.empty(this.configDefinition.application)) {
      this.logger.error(`[APPLICATION] not provided`);
      return;
    }
    const list = this.workspaceService.configFilePaths(
      this.configDefinition.application,
    );
    this.applicationManager.setHeader('Config Files');
    this.screenService.print(
      chalk`Potential configuration files for {blue.bold ${this.configDefinition.application}}`,
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
}
