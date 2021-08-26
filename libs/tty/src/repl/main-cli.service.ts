import { DEFAULT_HEADER_FONT } from '@automagical/contracts/config';
import { iRepl } from '@automagical/contracts/tty';
import { AutoConfigService } from '@automagical/utilities';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';

import { Repl } from '../decorators';
import { ReplExplorerService } from '../services';

@Repl({
  consumesConfig: [DEFAULT_HEADER_FONT],
  name: 'Main',
})
export class MainCLIService implements iRepl {
  // #region Constructors

  constructor(
    private readonly configService: AutoConfigService,
    private readonly explorer: ReplExplorerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    clear();
    const header = figlet.textSync('Script List', {
      font: this.configService.get<figlet.Fonts>(DEFAULT_HEADER_FONT),
    });
    console.log(chalk.cyan(header), '\n');
    let scriptName = process.argv[2];
    if (!scriptName) {
      const { script } = await inquirer.prompt([
        {
          choices: [...this.explorer.REGISTERED_APPS.keys()]
            .filter((item) => item.name !== 'Main')
            .map((item) => item.name),
          message: 'Command',
          name: 'script',
          type: 'list',
        },
      ]);
      scriptName = script;
    }

    this.printHeader(scriptName);
    const script = this.explorer.findServiceByName(scriptName);
    await script.exec();
  }

  // #endregion Public Methods

  // #region Private Methods

  private printHeader(scriptName: string): void {
    const settings = this.explorer.findSettingsByName(scriptName);
    const header = figlet.textSync(settings.name, {
      font: this.configService.get<figlet.Fonts>(DEFAULT_HEADER_FONT),
    });
    clear();
    console.log(chalk.cyan(header), '\n');
    settings.description ??= [];
    settings.description =
      typeof settings.description === 'string'
        ? [settings.description]
        : settings.description;
    console.log(
      chalk.yellow(
        settings.description.map((line) => `      ${line}`).join(`\n`),
      ),
      `\n\n`,
    );
  }

  // #endregion Private Methods
}
