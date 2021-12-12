// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import {
  RoomDTO,
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@ccontour/controller-logic';
import {
  DONE,
  ICONS,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
} from '@ccontour/tty';
import { IsEmpty, ResultControlDTO, TitleCase } from '@ccontour/utilities';
import { forwardRef, Inject, NotImplementedException } from '@nestjs/common';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';
import inquirer from 'inquirer';

import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from '../rooms';
import { RoutineActivateService } from './routine-activate.service';
import { RoutineCommandService } from './routine-command.service';
import { RoutineSettingsService } from './routine-settings.service';

type RCService = RoomCommandService;
type RService = RoutineCommandService;
const MILLISECONDS = 1000;
@Repl({
  category: 'Control',
  icon: ICONS.ROUTINE,
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
    private readonly settings: RoutineSettingsService,
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

  public async exec(): Promise<void> {
    const list = await this.list();
    let action = await this.promptService.pickOne<RoutineDTO | string>(
      `Pick routine`,
      [
        ...this.promptService.conditionalEntries(!IsEmpty(list), [
          new inquirer.Separator(chalk.white`Current routines`),
          ...(list.map((i) => [
            i.friendlyName,
            i,
          ]) as PromptEntry<RoutineDTO>[]),
        ]),
        new inquirer.Separator(chalk.white`Actions`),
        [`${ICONS.CREATE}Create new`, 'create'],
      ],
    );
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
    let action = await this.promptService.menuSelect(
      [
        ...this.promptService.conditionalEntries(!IsEmpty(current), [
          new inquirer.Separator(chalk.white`Existing routines`),
          ...(current.map((item) => [
            item.friendlyName,
            item,
          ]) as PromptEntry<RoutineDTO>[]),
        ]),
        new inquirer.Separator(chalk.white`Maintenance`),
        [`${ICONS.CREATE}Create`, 'create'],
      ],
      `Pick routine`,
    );
    if (action === DONE) {
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
    return await this.processRoom(room);
  }

  public async processRoutine(
    routine: RoutineDTO,
    defaultAction?: string,
  ): Promise<void> {
    await this.header(routine);
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.ACTIVATE}Manual activate`, 'activate'],
        [`${ICONS.DELETE}Delete`, 'delete'],
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.EVENT}Activation Events`, 'events'],
        [`${ICONS.COMMAND}Commands`, 'command'],
        [`${ICONS.CONFIGURE}Settings`, 'settings'],
        [
          chalk[
            this.pinnedItems.isPinned('routine', routine._id) ? 'red' : 'green'
          ]`${ICONS.PIN}Pin`,
          'pin',
        ],
      ],
      `Manage routine`,
      defaultAction,
    );
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: routine.friendlyName,
          id: routine._id,
          script: 'routine',
        });
        return await this.processRoutine(routine, action);
      case DONE:
        return;
      case 'settings':
        await this.settings.process(routine);
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
    const action = await this.promptService.menuSelect(
      [
        [`Immediate`, 'immediate'],
        [`Timeout`, 'timeout'],
        ['At date/time', 'datetime'],
      ],
      `When to activate`,
    );
    switch (action) {
      case DONE:
        return;
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
      console.log(chalk.bold.blue`Activation Events`);
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
    console.log(chalk.bold.blue`Commands`);
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
