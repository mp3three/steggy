// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import {
  RoomDTO,
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@for-science/controller-logic';
import {
  DONE,
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@for-science/tty';
import { IsEmpty, ResultControlDTO, TitleCase } from '@for-science/utilities';
import { forwardRef, Inject, NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';

import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from '../rooms';
import { RoutineActivateService } from './routine-activate.service';
import { RoutineCommandService } from './routine-command.service';

type RCService = RoomCommandService;
type RService = RoutineCommandService;
const MILLISECONDS = 1000;
const SOLO = 1;

@Repl({
  category: 'Control',
  icon: ICONS.ROUTINE,
  keybind: 't',
  name: 'Routine',
})
export class RoutineService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly activateService: RoutineActivateService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
    @Inject(forwardRef(() => RoutineCommandService))
    private readonly routineCommand: RService,
    private readonly pinnedItems: PinnedItemService,
  ) {}

  public async create(room?: RoomDTO | string): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.friendlyName();
    return await this.fetchService.fetch<RoutineDTO, RoutineDTO>({
      body: {
        friendlyName,
        room: typeof room === 'string' ? room : room?._id,
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
        a: [all ? 'Show detached routines' : 'Show all routines', 'all'],
        c: [`${ICONS.CREATE}Create new`, 'create'],
        d: [chalk.bold`Done`, DONE],
      },
      right: ToMenuEntry(
        this.promptService.conditionalEntries(!IsEmpty(list), [
          ...(list.map((i) => [
            i.friendlyName,
            i,
          ]) as PromptEntry<RoutineDTO>[]),
        ]),
      ),
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
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
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
    if (IsEmpty(inList)) {
      inList = await this.list();
    }
    defaultValue = inList.find(
      ({ _id }) =>
        _id ===
        (typeof defaultValue === 'string' ? defaultValue : defaultValue?._id),
    );
    return await this.promptService.pickOne(
      `Pick a routine`,
      inList.map((i) => [i.friendlyName, i]),
    );
  }

  public async processRoom(room?: RoomDTO | string): Promise<void> {
    const control: ResultControlDTO = {};
    control.sort = ['friendlyName'];
    if (room) {
      control.filters ??= new Set();
      control.filters.add({
        field: 'room',
        value: typeof room === 'string' ? room : room._id,
      });
    }
    const current = await this.list(control);
    let action = await this.promptService.menu({
      keyMap: {
        c: [`${ICONS.CREATE}Create`, 'create'],
        d: [chalk.bold`Done`, DONE],
      },
      right: ToMenuEntry(
        current.map((item) => [
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
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    await this.processRoutine(action);
  }

  public async processRoutine(
    routine: RoutineDTO,
    defaultAction?: string,
  ): Promise<void> {
    await this.header(routine);
    const [activate, events, command] = [
      [`${ICONS.ACTIVATE}Manual activate`, 'activate'],
      [`${ICONS.EVENT}Activation Events`, 'events'],
      [`${ICONS.COMMAND}Commands`, 'command'],
    ] as PromptEntry[];
    const action = await this.promptService.menu({
      keyMap: {
        a: activate,
        c: command,
        d: [chalk.bold`Done`, DONE],
        e: events,
        p: [
          this.pinnedItems.isPinned('routine', routine._id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: [`${ICONS.RENAME}Rename`, 'rename'],
        s: [
          routine.sync
            ? `${ICONS.SWAP}Run commands in parallel`
            : `${ICONS.SWAP}Run commands in series`,
          `sync`,
        ],
        x: [`${ICONS.DELETE}Delete`, 'delete'],
      },
      right: ToMenuEntry([activate, events, command]),
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
        const friendlyName = await this.promptService.friendlyName(
          routine.friendlyName,
        );
        routine = await this.fetchService.fetch({
          body: {
            ...routine,
            friendlyName,
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
        d: [chalk.bold`Done`, DONE],
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
        await this.fetchService.fetch({
          method: 'post',
          url: `/routine/${routine._id}`,
        });
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

  protected onModuleInit(): void {
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
    if (IsEmpty(routine.activate)) {
      console.log(
        chalk.bold`{cyan >>> }${ICONS.EVENT}{yellow No activation events}`,
      );
    } else {
      console.log(chalk`  {blue.bold Activation Events}`);
      const table = new Table({
        head: ['Name', 'Type', 'Details'],
      });
      routine.activate.forEach((activate) => {
        table.push([
          activate.friendlyName,
          TitleCase(activate.type),
          this.promptService.objectPrinter(activate.activate),
        ]);
      });
      console.log(table.toString());
    }
    if (IsEmpty(routine.command)) {
      console.log(chalk.bold`{cyan >>> }${ICONS.COMMAND}{yellow No commands}`);
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
    await eachSeries(routine.command, async (command) => {
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
