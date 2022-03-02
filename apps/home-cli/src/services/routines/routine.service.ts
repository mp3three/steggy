// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import { CacheManagerService, InjectCache } from '@automagical/boilerplate';
import {
  RoomDTO,
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import {
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  TextRenderingService,
  ToMenuEntry,
} from '@automagical/tty';
import { is, LABEL, ResultControlDTO, TitleCase } from '@automagical/utilities';
import { forwardRef, Inject, NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';

import { MENU_ITEMS } from '../../includes';
import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from '../rooms';
import { RoutineActivateService } from './routine-activate.service';
import { RoutineCommandService } from './routine-command.service';

type RCService = RoomCommandService;
type RService = RoutineCommandService;
const MILLISECONDS = 1000;
const SOLO = 1;
const CACHE_KEY = `MENU_LAST_ROUTINE`;

@Repl({
  category: 'Control',
  icon: ICONS.ROUTINE,
  keybind: 't',
  name: 'Routine',
})
export class RoutineService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly fetchService: HomeFetchService,
    private readonly textRender: TextRenderingService,
    private readonly promptService: PromptService,
    private readonly activateService: RoutineActivateService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
    @Inject(forwardRef(() => RoutineCommandService))
    private readonly routineCommand: RService,
    private readonly pinnedItems: PinnedItemService,
  ) {}

  private lastRoutine: string;

  public async activate(routine: RoutineDTO): Promise<void> {
    await this.fetchService.fetch({
      method: 'post',
      url: `/routine/${routine._id}`,
    });
  }

  public async create(room?: RoomDTO | string): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.friendlyName();
    return await this.fetchService.fetch<RoutineDTO, RoutineDTO>({
      body: {
        friendlyName,
        room: is.string(room) ? room : room?._id,
      },
      method: `post`,
      url: `/routine`,
    });
  }

  public async exec(all = false): Promise<void> {
    // List routines that are not attached to rooms
    const list = await this.list({
      filters: all
        ? undefined
        : new Set([
            {
              field: 'room',
              // eslint-disable-next-line unicorn/no-null
              value: null,
            },
          ]),
    });
    let action = await this.promptService.menu<RoutineDTO | string>({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        c: MENU_ITEMS.CREATE,
        d: MENU_ITEMS.DONE,
        t: [
          all
            ? chalk.dim.magenta('Show detached routines')
            : chalk.dim.blue('Show all routines'),
          'all',
        ],
      },
      keyMapCallback: async (action, [label, routine]) => {
        if (action === 'activate') {
          await this.activate(routine as RoutineDTO);
          return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + label;
        }
        return true;
      },
      right: ToMenuEntry(list.map(i => [i.friendlyName, i])),
      value: this.lastRoutine,
    });
    if (IsDone(action)) {
      return;
    }
    if (action === 'all') {
      return await this.exec(!all);
    }
    if (action === 'create') {
      action = await this.create();
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    this.lastRoutine = action._id;
    await this.cache.set(CACHE_KEY, action._id);
    await this.processRoutine(action);
  }

  public async get(id: string): Promise<RoutineDTO> {
    return await this.fetchService.fetch({
      url: `/routine/${id}`,
    });
  }

  public async list(control?: ResultControlDTO): Promise<RoutineDTO[]> {
    return await this.fetchService.fetch({
      control,
      url: `/routine`,
    });
  }

  public async pickOne(
    defaultValue: string | RoutineDTO,
    inList: RoutineDTO[] = [],
  ): Promise<RoutineDTO> {
    if (is.empty(inList)) {
      inList = await this.list();
    }
    defaultValue = inList.find(
      ({ _id }) =>
        _id === (is.string(defaultValue) ? defaultValue : defaultValue?._id),
    );
    return await this.promptService.pickOne(
      `Pick a routine`,
      inList.map(i => [i.friendlyName, i]),
    );
  }

  public async processRoom(room?: RoomDTO | string): Promise<void> {
    const control: ResultControlDTO = {};
    control.sort = ['friendlyName'];
    if (room) {
      control.filters ??= new Set();
      control.filters.add({
        field: 'room',
        value: is.string(room) ? room : room._id,
      });
    }
    const current = await this.list(control);
    let action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        c: MENU_ITEMS.CREATE,
        d: MENU_ITEMS.DONE,
      },
      keyMapCallback: async (action, [label, routine]) => {
        if (action === 'activate') {
          await this.activate(routine as RoutineDTO);
          return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + label;
        }
        return true;
      },
      right: ToMenuEntry(
        current.map(item => [
          item.friendlyName,
          item,
        ]) as PromptEntry<RoutineDTO>[],
      ),
    });
    if (IsDone(action)) {
      return;
    }
    if (action === 'create') {
      room = room || (await this.roomCommand.pickOne());
      action = await this.create(room);
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    await this.processRoutine(action);
  }

  public async processRoutine(
    routine: RoutineDTO,
    defaultAction?: string,
  ): Promise<void> {
    await this.header(routine);
    const [events, command] = [
      [`${ICONS.EVENT}Activation Events`, 'events'],
      [`${ICONS.COMMAND}Commands`, 'command'],
    ] as PromptEntry[];
    if (is.empty(routine.activate)) {
      events[LABEL] = chalk.red(events[LABEL]);
    }
    if (is.empty(routine.command)) {
      command[LABEL] = chalk.red(command[LABEL]);
    }
    const action = await this.promptService.menu({
      keyMap: {
        a: events,
        c: command,
        d: MENU_ITEMS.DONE,
        m: MENU_ITEMS.ACTIVATE,
        p: [
          this.pinnedItems.isPinned('routine', routine._id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        s: [
          routine.sync
            ? `${ICONS.SWAP}Run commands in parallel`
            : `${ICONS.SWAP}Run commands in series`,
          `sync`,
        ],
        x: [`${ICONS.DELETE}Delete`, 'delete'],
      },
      right: ToMenuEntry([MENU_ITEMS.ACTIVATE, events, command]),
      rightHeader: `Manage routine`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: routine.friendlyName,
          id: routine._id,
          script: 'routine',
        });
        return await this.processRoutine(routine, action);
      case 'sync':
        routine.sync = !routine.sync;
        routine = await this.update(routine);
        return await this.processRoutine(routine, action);
      case 'activate':
        await this.promptActivate(routine);
        return await this.processRoutine(routine, action);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.bold.magenta(
              routine.friendlyName,
            )}?`,
          ))
        ) {
          return await this.processRoutine(routine, action);
        }
        await this.fetchService.fetch({
          method: 'delete',
          url: `/routine/${routine._id}`,
        });
        break;
      case 'rename':
        routine = await this.fetchService.fetch({
          body: {
            ...routine,
            friendlyName: await this.promptService.friendlyName(
              routine.friendlyName,
            ),
          },
          method: `put`,
          url: `/routine/${routine._id}`,
        });
        return await this.processRoutine(routine, action);
      case 'events':
        routine = await this.activateService.processRoutine(routine);
        return await this.processRoutine(routine, action);
      case 'command':
        routine = await this.routineCommand.processRoutine(routine);
        return await this.processRoutine(routine, action);
    }
  }

  public async promptActivate(routine: RoutineDTO): Promise<void> {
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry([
        [`Immediate`, 'immediate'],
        [`Timeout`, 'timeout'],
        ['At date/time', 'datetime'],
      ]),
      rightHeader: `When to activate`,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'immediate':
        await this.activate(routine);
        return;
      case 'timeout':
        console.log(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timeout: (await this.promptService.timeout()) * MILLISECONDS,
          } as RoutineActivateOptionsDTO,
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return;
      case 'datetime':
        console.log(
          chalk.yellow`${ICONS.WARNING}Timers not persisted across controller reboots`,
        );
        await this.fetchService.fetch({
          body: {
            timestamp: await (
              await this.promptService.timestamp(`Activation time`)
            ).toISOString(),
          } as RoutineActivateOptionsDTO,
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return;
    }
    throw new NotImplementedException();
  }

  public async update(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.fetchService.fetch({
      body: routine,
      method: 'put',
      url: `/routine/${routine._id}`,
    });
  }

  protected async onModuleInit(): Promise<void> {
    this.lastRoutine = await this.cache.get(CACHE_KEY);
    this.pinnedItems.loaders.set('routine', async ({ id }) => {
      const routine = await this.get(id);
      await this.processRoutine(routine);
    });
  }

  private async header(routine: RoutineDTO): Promise<void> {
    await this.promptService.clear();
    this.promptService.scriptHeader(`Routine`);
    this.promptService.secondaryHeader(routine.friendlyName);
    console.log(
      chalk`${ICONS.LINK} {bold.magenta POST} ${this.fetchService.getUrl(
        `/routine/${routine._id}`,
      )}`,
    );
    console.log();
    if (!is.empty(routine.activate)) {
      console.log(chalk`  {blue.bold Activation Events}`);
      const table = new Table({
        head: ['Name', 'Type', 'Details'],
      });
      routine.activate.forEach(activate => {
        table.push([
          activate.friendlyName,
          TitleCase(activate.type),
          this.textRender.typePrinter(activate.activate),
        ]);
      });
      console.log(table.toString());
    }
    if (is.empty(routine.command)) {
      return;
    }
    const activation =
      routine.command.length === SOLO
        ? ``
        : chalk`{yellowBright (${routine.sync ? 'Series' : 'Parallel'})}`;
    console.log(chalk`  {bold.blue Commands} ${activation}`);
    const table = new Table({
      head: ['Name', 'Type', 'Details'],
    });
    await eachSeries(routine.command, async command => {
      if (!command) {
        return;
      }
      table.push([
        command.friendlyName,
        TitleCase(command.type),
        await this.routineCommand.commandDetails(routine, command),
      ]);
    });
    console.log(table.toString());
    console.log();
  }
}
