import {
  InjectConfig,
  iQuickScript,
  QuickScript,
  WorkspaceService,
} from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  SyncLoggerService,
  ToMenuEntry,
  TTYModule,
} from '@steggy/tty';
import { is } from '@steggy/utilities';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { exit } from 'process';

@QuickScript({
  application: Symbol('config-builder'),
  imports: [TTYModule],
})
export class ConfigScanner implements iQuickScript {
  constructor(
    private readonly logger: SyncLoggerService,
    @InjectConfig('DEFINITION_FILE') private readonly definitionFile: string,
    @InjectConfig('APPLICATION') private readonly applicationName: string,
    @InjectConfig('CONFIG_FILE')
    private readonly outputFile: string,
    private readonly workspaceService: WorkspaceService,
    private readonly screenService: ScreenService,
    private readonly promptService: PromptService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public async exec() {
    this.applicationManager.setHeader('Config Builder');
    const action = await this.promptService.menu({
      right: ToMenuEntry([['List config files', 'list-files']]),
    });
    switch (action) {
      case 'list-files':
        this.listConfigFiles();
        await this.promptService.acknowledge();
        return await this.exec();
      case '':
        return;
    }
  }

  protected onModuleInit() {
    if (is.empty(this.definitionFile)) {
      this.logger.error(`[DEFINITION_FILE] is required`);
      exit();
    }
    if (!existsSync(this.definitionFile)) {
      this.logger.error(
        `[DEFINITION_FILE] {${this.definitionFile}} does not exist`,
      );
      exit();
    }
    if (is.empty(this.applicationName) && is.empty(this.outputFile)) {
      this.logger.error(
        `Either [APPLICATION] / [CONFIG_FILE] must be provided`,
      );
      exit();
    }
  }

  private listConfigFiles() {
    if (is.empty(this.applicationName)) {
      this.logger.error(`[APPLICATION] not provided`);
      return;
    }
    const list = this.workspaceService.configFilePaths(this.applicationName);
    this.applicationManager.setHeader('Config Files');
    this.screenService.print(
      chalk`Potential configuration files for {blue.bold ${this.applicationName}}`,
    );
    list.forEach(item =>
      this.screenService.print(
        chalk`  {${existsSync(item) ? 'green' : 'red'} ${item}}`,
      ),
    );
  }
}
