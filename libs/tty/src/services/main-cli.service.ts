import {
  AutoLogService,
  CacheManagerService,
  DOWN,
  InjectCache,
  is,
  UP,
  VALUE,
} from '@for-science/utilities';
import chalk from 'chalk';

import { iRepl, ReplOptions } from '../contracts';
import { Repl } from '../decorators';
import { MainMenuEntry, MenuEntry } from '../inquirer';
import { PinnedItemDTO, PinnedItemService } from './pinned-item.service';
import { PromptEntry, PromptService } from './prompt.service';
import { ReplExplorerService } from './repl-explorer.service';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
const CACHE_KEY = 'MAIN-CLI:LAST_LABEL';
type ENTRY_TYPE = string | PinnedItemDTO;

@Repl({
  category: 'main',
  name: 'Main',
})
export class MainCLIService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly explorer: ReplExplorerService,
    private readonly promptService: PromptService,
    private readonly pinnedItem: PinnedItemService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
  ) {}
  private last: unknown;

  public async exec(): Promise<void> {
    this.promptService.clear();
    this.promptService.scriptHeader('Script List');

    const name = await this.pickOne();
    if (!is.string(name)) {
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

  private getLeft() {
    const entries = this.pinnedItem.getEntries();
    return entries.map((i) => ({
      entry: i,
      type: (i[VALUE] as PinnedItemDTO).script,
    })) as MainMenuEntry<ENTRY_TYPE>[];
  }

  private getRight(types: Record<string, PromptEntry<ENTRY_TYPE>[]>) {
    const right: MainMenuEntry<ENTRY_TYPE>[] = [];
    Object.keys(types).forEach((type) => {
      types[type]
        .sort((a, b) => {
          if (!Array.isArray(a) || !Array.isArray(b)) {
            return DOWN;
          }
          const a1 = String(a[VALUE]).replace(unsortable, '');
          const b1 = String(b[VALUE]).replace(unsortable, '');
          if (a1 > b1) {
            return UP;
          }
          return DOWN;
        })
        .forEach((i) => {
          right.push({
            entry: i as MenuEntry,
            type: type,
          });
        });
    });
    return right;
  }

  private async pickOne(): Promise<ENTRY_TYPE> {
    const types: Record<string, PromptEntry<ENTRY_TYPE>[]> = {};
    const keyMap = {};
    this.explorer.REGISTERED_APPS.forEach(
      (
        instance: iRepl,
        { category: type, name, icon, keybind, keyOnly }: ReplOptions,
      ) => {
        if (name !== 'Main') {
          if (keybind) {
            keyMap[keybind] = [`${icon}${name}`, name];
            if (keyOnly) {
              return;
            }
          }
          types[type] ??= [];
          types[type].push([`${icon}${name}`, name]);
        }
      },
    );
    const right = this.getRight(types);
    const left = this.getLeft();
    if (is.object(this.last) && this.last !== null) {
      this.last = left.find((i) => {
        return (
          (i.entry[VALUE] as PinnedItemDTO).id ===
          (this.last as PinnedItemDTO).id
        );
      })?.entry[VALUE];
    }
    const result = await this.promptService.menu<ENTRY_TYPE>({
      keyMap,
      left,
      leftHeader: 'Pinned Items',
      right,
      titleTypes: true,
      value: this.last,
    });
    this.last = result;
    await this.cacheService.set(CACHE_KEY, result);
    return result;
  }

  private printHeader(scriptName: string): void {
    const settings = this.explorer.findSettingsByName(scriptName);
    this.promptService.scriptHeader(settings.name);
    if (!settings.description) {
      return;
    }
    settings.description ??= [];
    settings.description = is.string(settings.description)
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
