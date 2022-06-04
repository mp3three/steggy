/* eslint-disable radar/no-duplicate-string */
import { INestApplication, Inject, Injectable } from '@nestjs/common';
import {
  AbstractConfig,
  CacheManagerService,
  CONFIG_DEFAULTS,
  InjectCache,
  InjectConfig,
  ScanConfig,
} from '@steggy/boilerplate';
import { InflatedPinDTO } from '@steggy/controller-shared';
import {
  ApplicationManagerService,
  IsDone,
  KeyMap,
  PromptService,
} from '@steggy/tty';
import { is, VALUE } from '@steggy/utilities';
import { exit } from 'process';

import { APP_TITLE, CONFIG_SCANNER } from '../config';
import { MENU_ITEMS } from '../includes';
import { ICONS } from '../types';
import { DebugService } from './debug.service';
import { GroupCommandService } from './groups';
import { EntityService, ServerControlService } from './home-assistant';
import { PersonCommandService } from './people';
import { PinnedItemService } from './pinned-item.service';
import { RoomCommandService } from './rooms';
import { RoutineService } from './routines';

// Filter out non-sortable characters (like emoji)
const CACHE_KEY = 'MAIN-CLI:LAST_LABEL';
type ENTRY_TYPE = string | InflatedPinDTO;

@Injectable()
export class MainCLIService {
  constructor(
    private readonly applicationManager: ApplicationManagerService,
    private readonly debugService: DebugService,
    private readonly entityService: EntityService,
    private readonly groupService: GroupCommandService,
    private readonly personService: PersonCommandService,
    private readonly pinnedItem: PinnedItemService,
    private readonly promptService: PromptService,
    private readonly roomService: RoomCommandService,
    private readonly routineService: RoutineService,
    private readonly serverControl: ServerControlService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    @InjectConfig(APP_TITLE)
    private readonly applicationTitle,
    @Inject(CONFIG_DEFAULTS) private readonly defaultConfig: AbstractConfig,
    @InjectConfig(CONFIG_SCANNER) private readonly configScanner: boolean,
  ) {}
  private last: ENTRY_TYPE;

  public async exec(): Promise<void> {
    this.applicationManager.setHeader(this.applicationTitle);
    const name = await this.pickOne();
    if (IsDone(name)) {
      return;
    }
    if (!is.string(name)) {
      await this.pinnedItem.exec(name as InflatedPinDTO);
      return this.exec();
    }
    switch (name) {
      case 'routines':
        await this.routineService.exec();
        break;
      case 'rooms':
        await this.roomService.exec();
        break;
      case 'groups':
        await this.groupService.exec();
        break;
      case 'entities':
        await this.entityService.exec();
        break;
      case 'server-control':
        await this.serverControl.exec();
        break;
      case 'debug':
        await this.debugService.exec();
        break;
      case 'people':
        await this.personService.exec();
        break;
    }
    await this.exec();
  }

  protected async onModuleInit(): Promise<void> {
    this.last = await this.cacheService.get(CACHE_KEY);
  }

  protected onPreInit(app: INestApplication): void {
    if (!this.configScanner) {
      return;
    }
    // Match the functionality provided by `@QuickScript`
    console.log(JSON.stringify(ScanConfig(app, this.defaultConfig)));
    exit();
  }

  private async pickOne(): Promise<ENTRY_TYPE> {
    const keyMap: KeyMap = {
      d: MENU_ITEMS.DONE,
      f12: [`${ICONS.DEBUG}Debugger`, 'debug'],
      g: [`${ICONS.GROUPS}Groups`, 'groups'],
      r: [`${ICONS.ROOMS}Rooms`, 'rooms'],
      t: [`${ICONS.ROUTINE}Routines`, 'routines'],
    };
    const left = this.pinnedItem.getEntries();
    if (this.last) {
      const found = left.find(({ entry: [, value] }) =>
        is.string(this.last)
          ? false
          : value.id === (this.last as InflatedPinDTO).id,
      );
      this.last = found?.entry[VALUE] ?? this.last;
    }
    const result = await this.promptService.menu<ENTRY_TYPE>({
      keyMap,
      left,
      leftHeader: 'Pinned Items',
      right: [
        { entry: [`${ICONS.GROUPS}Groups`, 'groups'], type: 'Controller' },
        { entry: [`${ICONS.PEOPLE}People`, 'people'], type: 'Controller' },
        { entry: [`${ICONS.ROOMS}Rooms`, 'rooms'], type: 'Controller' },
        { entry: [`${ICONS.ROUTINE}Routines`, 'routines'], type: 'Controller' },
        {
          entry: [`${ICONS.ADMIN}Server Control`, 'server-control'],
          type: 'Home Assistant',
        },
        {
          entry: [`${ICONS.ENTITIES}Entities`, 'entities'],
          type: 'Home Assistant',
        },
      ],
      titleTypes: true,
      value: this.last,
    });
    this.last = result;
    if (!IsDone(result)) {
      await this.cacheService.set(CACHE_KEY, result);
    }
    return result;
  }
}
