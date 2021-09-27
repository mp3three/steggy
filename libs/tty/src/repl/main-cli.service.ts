import { AutoLogService, InjectConfig } from '@automagical/utilities';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { REPL_TYPE, ReplOptions } from '..';
import { DEFAULT_HEADER_FONT } from '../config';
import { iRepl } from '../contracts/i-repl.interface';
import { Repl } from '../decorators';
import { PromptService, ReplExplorerService } from '../services';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');

@Repl({
  name: 'Main',
  type: REPL_TYPE.misc,
})
export class MainCLIService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: figlet.Fonts,
    private readonly explorer: ReplExplorerService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultSelection?: string): Promise<void> {
    this.promptService.clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
    });
    console.log(chalk.cyan(header), '\n');

    const [scriptName, instance] = await this.getScript(defaultSelection);
    this.printHeader(scriptName);

    await instance.exec();
    await this.exec(scriptName);
  }

  /**
   * Prompt the user for a script to run
   *
   * If a script name was passed as a command line arg, directly run it
   */
  private async getScript(script?: string): Promise<[string, iRepl]> {
    const scriptName = process.argv[2];
    if (!scriptName || typeof script !== 'undefined') {
      return await this.promptService.pickOne(
        'Command',
        this.scriptList()
          .filter((item) => {
            if (Array.isArray(item)) {
              return item[0] !== 'Main';
            }
            return true;
          })
          .map((item) => {
            if (!Array.isArray(item)) {
              return item;
            }
            return {
              name: item[0],
              value: item,
            };
          }),
        script,
      );
    }
    const instance = this.explorer.findServiceByName(scriptName);
    if (!instance) {
      this.logger.error(`Invalid script name ${script}`);
      return await this.getScript('');
    }
    return [scriptName, this.explorer.findServiceByName(scriptName)];
  }

  private scriptList(): ([string, iRepl] | Separator)[] {
    const types: Partial<Record<REPL_TYPE, [string, iRepl][]>> = {};
    this.explorer.REGISTERED_APPS.forEach(
      (instance: iRepl, { type, name }: ReplOptions) => {
        types[type] ??= [];
        types[type].push([name, instance]);
      },
    );
    const out: ([string, iRepl] | Separator)[] = [];
    Object.keys(REPL_TYPE).forEach((type) => {
      out.push(
        new inquirer.Separator(
          `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
        ),
        ...types[type].sort(([a], [b]) => {
          a = a.replace(unsortable, '');
          b = b.replace(unsortable, '');
          if (a > b) {
            return 1;
          }
          return -1;
        }),
      );
    });
    return out;
  }

  private printHeader(scriptName: string): void {
    const settings = this.explorer.findSettingsByName(scriptName);
    const header = figlet.textSync(settings.name, {
      font: this.font,
    });
    this.promptService.clear();
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
