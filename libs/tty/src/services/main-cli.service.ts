import {
  AutoLogService,
  CacheManagerService,
  DOWN,
  InjectCache,
  InjectConfig,
  UP,
  VALUE,
} from '@ccontour/utilities';
import chalk from 'chalk';
import figlet, { Fonts } from 'figlet';
import inquirer from 'inquirer';
import Separator from 'inquirer/lib/objects/separator';

import { DEFAULT_HEADER_FONT } from '../config';
import { iRepl, ReplOptions } from '../contracts';
import { Repl } from '../decorators';
import { MainMenuEntry, MainMenuOptions } from '../inquirer';
import { PinnedItemDTO } from '.';
import { PinnedItemService } from './pinned-item.service';
import { PromptEntry, PromptService } from './prompt.service';
import { ReplExplorerService } from './repl-explorer.service';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
const NAME = 1;
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
  private last: unknown;

  public async exec(): Promise<void> {
    this.promptService.clear();
    const header = figlet.textSync('Script List', {
      font: this.font,
    });
    console.log(chalk.cyan(header), '\n');

    const name = await this.pickOne();
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
    this.last = await this.cacheService.get(CACHE_KEY);
  }

  private async pickOne(): Promise<ENTRY_TYPE> {
    const entries = this.pinnedItem.getEntries();

    const types: Record<string, PromptEntry[]> = {};
    this.explorer.REGISTERED_APPS.forEach(
      (instance: iRepl, { category: type, name, icon }: ReplOptions) => {
        if (name !== 'Main') {
          types[type] ??= [];
          types[type].push([`${icon}${name}`, name]);
        }
      },
    );
    const out: MainMenuEntry[] = [];
    Object.keys(types).forEach((type) => {
      types[type]
        .sort((a, b) => {
          if (a instanceof Separator || b instanceof Separator) {
            return DOWN;
          }
          const a1 = a[NAME].replace(unsortable, '');
          const b1 = b[NAME].replace(unsortable, '');
          if (a1 > b1) {
            return UP;
          }
          return DOWN;
        })
        .forEach((i) => {
          out.push({
            entry: i,
            type: type,
          });
        });
    });
    const pinned = entries.map((i) => ({
      entry: i,
      type: (i[VALUE] as PinnedItemDTO).script,
    })) as MainMenuEntry[];
    const result = await this.promptService.menu({
      keyMap: {},
      left: pinned,
      leftHeader: 'Pinned',
      right: out,
      value: this.last,
    });
    this.last = result;
    await this.cacheService.set(CACHE_KEY, result);
    return result;
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
}
