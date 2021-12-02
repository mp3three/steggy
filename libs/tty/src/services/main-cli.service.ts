import {
  AutoLogService,
  CacheManagerService,
  DOWN,
  InjectCache,
  InjectConfig,
  IsEmpty,
  TitleCase,
  UP,
} from '@ccontour/utilities';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';
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
const VALUE = 1;
const LABEL = 0;
const CACHE_KEY = 'MAIN-CLI:LAST_LABEL';
type ENTRY_TYPE = string | PinnedItemDTO;

@Repl({
  category: 'main',
  name: 'Main',
})
export class MainCLIService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(DEFAULT_HEADER_FONT) private readonly font: Fonts,
    private readonly explorer: ReplExplorerService,
    private readonly promptService: PromptService,
    private readonly pinnedItem: PinnedItemService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
  ) {}
  private lastLabel: string;

  public async exec(): Promise<void> {
    this.promptService.clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
    });
    console.log(chalk.cyan(header), '\n');

    const name = await this.getScript();
    if (typeof name !== 'string') {
      await this.pinnedItem.exec(name);
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
    await this.exec();
  }

  protected async onModuleInit(): Promise<void> {
    this.lastLabel = await this.cacheService.get(CACHE_KEY);
  }

  /**
   * Prompt the user for a script to run
   *
   * If a script name was passed as a command line arg, directly run it
   */
  private async getScript(): Promise<ENTRY_TYPE> {
    const scriptName = process.argv[SCRIPT_ARG];
    if (scriptName) {
      const instance = this.explorer.findServiceByName(scriptName);
      if (instance) {
        return scriptName;
      }
    }

    const entries = this.pinnedItem.getEntries();
    if (!scriptName) {
      const values = [
        ...this.promptService.conditionalEntries(!IsEmpty(entries), [
          new inquirer.Separator(chalk.white`${ICONS.PIN}Pinned`),
          ...this.promptService.sort(entries),
        ]),
        ...this.scriptList(),
      ] as PromptEntry<ENTRY_TYPE>[];
      const defaultSelection =
        values.find((i) => Array.isArray(i) && i[LABEL] === this.lastLabel) ??
        ([``, undefined] as PromptEntry<ENTRY_TYPE>);
      const out = await this.promptService.pickOne<ENTRY_TYPE>(
        'Command',
        values,
        defaultSelection[VALUE],
      );
      this.lastLabel = values.find((i) => Array.isArray(i) && i[VALUE] === out)[
        LABEL
      ];
      await this.cacheService.set(CACHE_KEY, this.lastLabel);
      return out;
    }
    const instance = this.explorer.findServiceByName(scriptName);
    if (!instance) {
      // this.logger.error(`Invalid script name ${script}`);
      return await this.getScript();
    }
    return scriptName;
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
