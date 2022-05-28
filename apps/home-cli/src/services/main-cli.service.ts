/* eslint-disable radar/no-duplicate-string */
import { Injectable } from '@nestjs/common';
import {
  CacheManagerService,
  InjectCache,
  InjectConfig,
} from '@steggy/boilerplate';
import { InflatedPinDTO } from '@steggy/controller-shared';
import {
  ApplicationManagerService,
  KeyMap,
  MainMenuEntry,
  MenuEntry,
  PromptEntry,
  PromptService,
} from '@steggy/tty';
import { DOWN, is, UP, VALUE } from '@steggy/utilities';

import { APP_TITLE } from '../config';
import { ICONS } from '../types';
import { DebugService } from './debug.service';
import { GroupCommandService } from './groups';
import {
  EntityService,
  ServerControlService,
  ServerLogsService,
} from './home-assistant';
import { PersonCommandService } from './people';
import { PinnedItemService } from './pinned-item.service';
import { RoomCommandService } from './rooms';
import { RoutineService } from './routines';

// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
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
    private readonly serverLogs: ServerLogsService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
    @InjectConfig(APP_TITLE)
    private readonly applicationTitle,
  ) {}
  private last: ENTRY_TYPE;

  public async exec(): Promise<void> {
    this.applicationManager.setHeader(this.applicationTitle);
    const name = await this.pickOne();
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
      case 'server-logs':
        await this.serverLogs.exec();
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

  private getRight(types: Record<string, PromptEntry<ENTRY_TYPE>[]>) {
    const right: MainMenuEntry<ENTRY_TYPE>[] = [];
    Object.keys(types).forEach(type => {
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
        .forEach(i => {
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
    const keyMap: KeyMap = {
      f12: [`${ICONS.DEBUG}Debugger`, 'debug'],
      g: [`${ICONS.GROUPS}Groups`, 'groups'],
      r: [`${ICONS.ROOMS}Rooms`, 'rooms'],
      t: [`${ICONS.ROUTINE}Routines`, 'routines'],
    };

    const result = await this.promptService.menu<ENTRY_TYPE>({
      keyMap,
      left: this.pinnedItem.getEntries(),
      leftHeader: 'Pinned Items',
      right: [
        { entry: [`${ICONS.GROUPS}Groups`, 'groups'], type: 'Controller' },
        { entry: [`${ICONS.PEOPLE}People`, 'people'], type: 'Controller' },
        { entry: [`${ICONS.ROOMS}Rooms`, 'rooms'], type: 'Controller' },
        { entry: [`${ICONS.ROUTINE}Routines`, 'routines'], type: 'Controller' },
        // {
        //   entry: [`${ICONS.ROUTINE}Server Logs`, 'server-logs'],
        //   type: 'Home Assistant',
        // },
        // {
        //   entry: [`${ICONS.ADMIN}Server Control`, 'server-control'],
        //   type: 'Home Assistant',
        // },
        {
          entry: [`${ICONS.ENTITIES}Entities`, 'entities'],
          type: 'Home Assistant',
        },
      ],
      titleTypes: true,
      value: this.last,
    });
    this.last = result;
    await this.cacheService.set(CACHE_KEY, result);
    return result;
  }
}
