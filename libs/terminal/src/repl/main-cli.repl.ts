import { CLIService, FigletFonts } from '@automagical/contracts/terminal';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';

@Injectable()
export class MainCLIREPL {
  // #region Object Properties

  public readonly scripts = new Map<string, CLIService>();

  // #endregion Object Properties

  // #region Public Methods

  public addScript(service: CLIService): void {
    this.scripts.set(this.scriptName(service.name), service);
  }

  public async confirm(prompt: string, defaultValue = false): Promise<boolean> {
    const { result } = await inquirer.prompt([
      {
        default: defaultValue,
        message: prompt,
        name: 'result',
        prefix: chalk.yellow('warning'),
        type: 'confirm',
      },
    ]);
    return result;
  }

  public async main(headerText: string): Promise<void> {
    // Print list of available commands
    clear();
    let header = figlet.textSync(headerText, {
      font: FigletFonts.header,
    });
    console.log(chalk.cyan(header), '\n');
    let scriptName = process.argv[2];
    if (!scriptName) {
      const { script } = await inquirer.prompt([
        {
          choices: [...this.scripts.values()].map((item) => item.name),
          message: 'Command',
          name: 'script',
          type: 'list',
        },
      ]);
      scriptName = this.scriptName(script);
    }

    // Print header for script, then execute
    const script = this.scripts.get(scriptName);
    header = figlet.textSync(script.name, {
      font: FigletFonts.header,
    });
    clear();
    console.log(chalk.cyan(header), '\n');
    console.log(
      chalk.yellow(
        script.description.map((line) => `      ${line}`).join(`\n`),
      ),
      `\n\n`,
    );
    await script.exec();
  }

  // #endregion Public Methods

  // #region Private Methods

  private scriptName(name: string): string {
    return name.toLowerCase().replace(new RegExp(' ', 'g'), '-');
  }

  // #endregion Private Methods
}
