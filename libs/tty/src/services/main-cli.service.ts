import {
  AutoLogService,
  DOWN,
  InjectConfig,
  IsEmpty,
  TitleCase,
  UP,
} from '@automagical/utilities';
import { InternalServerErrorException } from '@nestjs/common';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { DEFAULT_HEADER_FONT } from '../config';
import { ICONS, iRepl, ReplOptions } from '../contracts';
import { Repl } from '../decorators';
import { PinnedItemDTO } from '.';
import { PinnedItemService } from './pinned-item.service';
import { PromptEntry, PromptService } from './prompt.service';
import { ReplExplorerService } from './repl-explorer.service';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
const SCRIPT_ARG = 2;
const NAME = 1;
const LABEL = 0;

@Repl({
  category: 'main',
  name: 'Main',
})
export class MainCLIService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: figlet.Fonts,
    private readonly explorer: ReplExplorerService,
    private readonly promptService: PromptService,
    private readonly pinnedItem: PinnedItemService,
  ) {}

  public async exec(defaultSelection?: string): Promise<void> {
    this.promptService.clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
    });
    console.log(chalk.cyan(header), '\n');

    const out = await this.getScript(defaultSelection);
    if (!Array.isArray(out)) {
      throw new InternalServerErrorException();
    }
    const scriptName = out.shift() as string;
    const name = out.shift();
    if (typeof name !== 'string') {
      await this.pinnedItem.exec(name as PinnedItemDTO);
      return this.exec();
    }
    this.printHeader(name);
    let instance: iRepl;
    this.explorer.REGISTERED_APPS.forEach((i, options) => {
      if (options.name === name) {
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
  private async getScript(
    script?: string,
  ): Promise<PromptEntry<PinnedItemDTO>> {
    const scriptName = process.argv[SCRIPT_ARG];
    const entries = this.pinnedItem.getEntries();
    if (!scriptName || typeof script !== 'undefined') {
      return await this.promptService.pickOne(
        'Command',
        [
          ...this.promptService.conditionalEntries(!IsEmpty(entries), [
            new inquirer.Separator(chalk.white`${ICONS.PIN}Pinned`),
            ...entries,
          ]),
          ...(this.scriptList().map((i) =>
            i instanceof Separator ? i : [i[LABEL], i],
          ) as PromptEntry<[string, string]>[]),
        ],
        script,
      );
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
      .sort((a, b) => (a > b ? UP : DOWN))
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
