import { iRepl } from '@automagical/contracts/tty';
import { InjectConfig } from '@automagical/utilities';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';

import { DEFAULT_HEADER_FONT } from '../config';
import { Repl } from '../decorators';
import { ReplExplorerService } from '../services';

@Repl({
  name: 'Main',
})
export class MainCLIService implements iRepl {
  // #region Constructors

  constructor(
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: figlet.Fonts,
    private readonly explorer: ReplExplorerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
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
      font: this.font,
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
