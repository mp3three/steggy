import { InjectConfig } from '@automagical/utilities';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';

import { DEFAULT_HEADER_FONT } from '../config';
import { iRepl } from '../contracts/i-repl.interface';
import { Repl } from '../decorators';
import { ReplExplorerService } from '../services';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');

@Repl({
  name: 'Main',
})
export class MainCLIService implements iRepl {
  constructor(
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: figlet.Fonts,
    private readonly explorer: ReplExplorerService,
  ) {}

  public async exec(defaultSelection?: string): Promise<void> {
    clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
    });
    console.log(chalk.cyan(header), '\n');
    let scriptName = process.argv[2];
    if (!scriptName || typeof defaultSelection !== 'undefined') {
      const { script } = await inquirer.prompt([
        {
          choices: [...this.explorer.REGISTERED_APPS.keys()]
            .filter((item) => item.name !== 'Main')
            .map((item) => item.name)
            .sort((a, b) => {
              a = a.replace(unsortable, '');
              b = b.replace(unsortable, '');
              if (a > b) {
                return 1;
              }
              return -1;
            }),
          default: defaultSelection,
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
    this.exec(scriptName);
  }

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
}
