// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import { RoomDTO, RoutineDTO } from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { IsEmpty, ResultControlDTO } from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { dump } from 'js-yaml';

import { ICONS } from '../../typings';
import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from '../rooms';
import { RoutineCommandService } from './rountine-command.service';
import { RoutineActivateEventsService } from './routine-activate-events.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly activateService: RoutineActivateEventsService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RoomCommandService,
    @Inject(forwardRef(() => RoutineCommandService))
    private readonly activateCommand: RoutineCommandService,
  ) {}

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
      const friendlyName = await this.promptService.friendlyName();
      action = await this.fetchService.fetch<RoutineDTO, RoutineDTO>({
        body: {
          friendlyName,
          room: typeof room === 'string' ? room : room._id,
        },
        method: `post`,
        url: `/routine`,
      });
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    await this.processRoutine(action);
  }

  public async processRoutine(routine: RoutineDTO): Promise<void> {
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
        [`${ICONS.DELETE}Remove`, 'remove'],
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.EVENT}Activation Events`, 'events'],
        [`${ICONS.COMMAND}Commands`, 'command'],
      ],
      `Manage routine`,
    );
    switch (action) {
      case DONE:
        return;
      case 'activate':
        await this.fetchService.fetch({
          method: 'post',
          url: `/routine/${routine._id}`,
        });
        return await this.processRoutine(routine);
      case 'remove':
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
        return await this.processRoutine(routine);
      case 'events':
        routine = await this.activateService.processRoutine(routine);
        return await this.processRoutine(routine);
      case 'command':
        routine = await this.activateCommand.processRoutine(routine);
        return await this.processRoutine(routine);
    }
  }

  public async update(routine: RoutineDTO): Promise<RoutineDTO> {
    return await this.fetchService.fetch({
      body: routine,
      method: 'put',
      url: `/routine/${routine._id}`,
    });
  }
}
