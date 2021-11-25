// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import { RoomDTO, RoutineDTO } from '@ccontour/controller-logic';
import {
  DONE,
  ICONS,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
} from '@ccontour/tty';
import { IsEmpty, ResultControlDTO } from '@ccontour/utilities';
import { forwardRef, Inject, NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { dump } from 'js-yaml';

import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from '../rooms';
import { RoutineActivateService } from './routine-activate.service';
import { RoutineCommandService } from './routine-command.service';

type RCService = RoomCommandService;
type RService = RoutineCommandService;
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
    private readonly activateCommand: RService,
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
    this.promptService.clear();
    this.promptService.scriptHeader(`Routine`);
    console.log(chalk.bold.yellow`${routine.friendlyName}`);
    console.log(
      chalk`${ICONS.LINK} {bold.magenta POST} ${this.fetchService.getUrl(
        `/routine/${routine._id}`,
      )}`,
    );
    this.promptService.print(
      dump({
        activate: routine.activate,
        command: routine.command,
      }),
    );
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.ACTIVATE}Manual activate`, 'activate'],
        [`${ICONS.DELETE}Delete`, 'delete'],
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.EVENT}Activation Events`, 'events'],
        [`${ICONS.COMMAND}Commands`, 'command'],
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
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/routine/${routine._id}`,
        });
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
        routine = await this.activateCommand.processRoutine(routine);
        return await this.processRoutine(routine, action);
    }
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
}
