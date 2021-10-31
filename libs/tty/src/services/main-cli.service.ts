import {
  AutoLogService,
  InjectConfig,
  IsEmpty,
  TitleCase,
} from '@automagical/utilities';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { DEFAULT_HEADER_FONT } from '../config';
import { iRepl } from '../contracts/i-repl.interface';
import { ReplOptions } from '../contracts/repl-options.dto';
import { Repl } from '../decorators';
import { PromptEntry, PromptService, ReplExplorerService } from '.';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
const SCRIPT_ARG = 2;
const UP = 1;
const NAME = 1;
const DOWN = -1;
type ScriptItem = {
  title: string;
  name: string;
  instance: iRepl;
};

@Repl({
  name: 'Main',
  category: 'main',
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

    const [scriptName, name] = await this.getScript(defaultSelection);
    this.printHeader(scriptName);
    let instance: iRepl;
    this.explorer.REGISTERED_APPS.forEach((i, opts) => {
      if (opts.name === name) {
        instance = i;
      }
    });

    await instance.exec();
    await this.exec(scriptName);
  }

  /**
   * Prompt the user for a script to run
   *
   * If a script name was passed as a command line arg, directly run it
   */
  private async getScript(script?: string): Promise<[string, string]> {
    const scriptName = process.argv[SCRIPT_ARG];
    if (!scriptName || typeof script !== 'undefined') {
      return (await this.promptService.pickOne(
        'Command',
        this.scriptList().map((i) => (i instanceof Separator ? i : [i[0], i])),
        script,
      )) as [string, string];
    }
    const instance = this.explorer.findServiceByName(scriptName);
    if (!instance) {
      this.logger.error(`Invalid script name ${script}`);
      return await this.getScript('');
    }
    return [scriptName, scriptName];
  }

  private printHeader(scriptName: string): void {
    const settings = this.explorer.findSettingsByName(scriptName);
    this.promptService.scriptHeader(settings.name);
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

  private scriptList(): PromptEntry[] {
    const types: Record<string, PromptEntry[]> = {};
    this.explorer.REGISTERED_APPS.forEach(
      (instance: iRepl, { category: type, name, icon }: ReplOptions) => {
        if (name !== 'Main') {
          types[type] ??= [];
          types[type].push([`${icon}${name}`, name]);
        }
      },
    );
    const out: PromptEntry[] = [];
    Object.keys(types)
      .sort()
      .forEach((type) => {
        out.push(
          new inquirer.Separator(chalk.white(TitleCase(type))),
          ...types[type].sort((a, b) => {
            if (a instanceof Separator || b instanceof Separator) {
              return DOWN;
            }
            const a1 = a[NAME].replace(unsortable, '');
            const b1 = b[NAME].replace(unsortable, '');
            if (a1 > b1) {
              return UP;
            }
            return DOWN;
          }),
        );
      });
    return out;
  }
}
