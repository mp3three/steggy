// There really needs to be a minimum function complexity on this...
// Really don't care if a simple map function is duplicated
/* eslint-disable radar/no-identical-functions */

import {
  KunamiCodeActivateDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomActionDTO,
  RoutineCommandRoomStateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService, Repl } from '@automagical/tty';
import { IsEmpty, TitleCase } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import inquirer from 'inquirer';

import { ICONS } from '../../typings';
import { GroupCommandService, GroupStateService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { RoomStateService } from '../rooms';
import { GroupActionService } from './group-action.service';
import { KunamiBuilderService } from './kunami-builder.service';
import { RoomActionService } from './room-action.service';
import { ScheduleBuilderService } from './schedule-builder.service';
import { StateChangeBuilderService } from './state-change-builder.service';

@Repl({
  category: 'Control',
  description: [`Control rooms and groups based on state changes and schdules`],
  icon: ICONS.ROUTINE,
  name: `Routines`,
})
export class RoutineCommandService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly groupAction: GroupActionService,
    private readonly groupCommand: GroupCommandService,
    private readonly groupState: GroupStateService,
    private readonly kunamiActivate: KunamiBuilderService,
    private readonly promptService: PromptService,
    private readonly schduleActivate: ScheduleBuilderService,
    private readonly stateActivate: StateChangeBuilderService,
    private readonly roomAction: RoomActionService,
    private readonly roomState: RoomStateService,
  ) {}

  public async build(current: Partial<RoutineDTO> = {}): Promise<RoutineDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const activate = await this.buildActivations(current.activate);

    return {
      activate,
      friendlyName,
    };
  }

  public async buildActivateEntry(
    current: Partial<RoutineActivateDTO> = {},
  ): Promise<RoutineActivateDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_TYPE>(
      `Activation type`,
      Object.values(ROUTINE_ACTIVATE_TYPE).map((value) => [
        TitleCase(value),
        value,
      ]),
      current.type,
    );
    switch (type) {
      case ROUTINE_ACTIVATE_TYPE.kunami:
        return {
          activate: await this.kunamiActivate.build(
            current.activate as KunamiCodeActivateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_TYPE.state_change:
        return {
          activate: await this.stateActivate.build(
            current.activate as StateChangeActivateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_TYPE.schedule:
        return {
          activate: await this.schduleActivate.build(
            current.activate as ScheduleActivateDTO,
          ),
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async buildActivations(
    current: RoutineActivateDTO[] = [],
  ): Promise<RoutineActivateDTO[]> {
    const action = await this.promptService.menuSelect([
      ['Add new activation event', 'add'],
      ...this.promptService.conditionalEntries(!IsEmpty(current), [
        new inquirer.Separator(),
        ...(current.map((item) => [
          item.friendlyName,
          item,
        ]) as PromptEntry<RoutineActivateDTO>[]),
      ]),
    ]);
    if (action === DONE) {
      return current;
    }
    if (action === 'add') {
      return await this.buildActivations([
        ...current,
        await this.buildActivateEntry(),
      ]);
    }
    return current;
  }

  public async buildCommandEntry(
    current: Partial<RoutineCommandDTO> = {},
  ): Promise<RoutineCommandDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_COMMAND>(
      `Activation type`,
      Object.values(ROUTINE_ACTIVATE_COMMAND).map((value) => [
        TitleCase(value),
        value,
      ]),
      current.type,
    );
    switch (type) {
      case ROUTINE_ACTIVATE_COMMAND.group_action:
        return {
          command: await this.groupAction.build(
            current.command as RoutineCommandGroupActionDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        return {
          command: await this.groupState.buildState(
            current?.command as RoutineCommandGroupStateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.room_action:
        return {
          command: await this.roomAction.build(
            current?.command as RoutineCommandRoomActionDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        return {
          command: await this.roomState.buildSaveState(
            current?.command as RoutineCommandRoomStateDTO,
          ),
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async buildCommands(
    current: RoutineCommandDTO[] = [],
  ): Promise<RoutineCommandDTO[]> {
    const action = await this.promptService.menuSelect([
      ['Add new activation event', 'add'],
      ...this.promptService.conditionalEntries(!IsEmpty(current), [
        new inquirer.Separator(),
        ...(current.map((item) => [
          item.friendlyName,
          item,
        ]) as PromptEntry<RoutineCommandDTO>[]),
      ]),
    ]);
    if (action === DONE) {
      return current;
    }
    if (action === 'add') {
      return await this.buildCommands([
        ...current,
        await this.buildCommandEntry(),
      ]);
    }
    return current;
  }

  public async exec(): Promise<void> {
    const current = await this.list();
    const action = await this.promptService.menuSelect([
      ['Create', 'create'],
      ...this.promptService.conditionalEntries(!IsEmpty(current), [
        new inquirer.Separator(),
        ...(current.map((item) => [
          item.friendlyName,
          item,
        ]) as PromptEntry<RoutineDTO>[]),
      ]),
    ]);
    if (action === DONE) {
      return;
    }
    if (action === 'create') {
      const body = await this.build();
      const routine = await this.fetchService.fetch<RoutineDTO>({
        body,
        method: `post`,
        url: `/routine`,
      });
      return await this.processRoutine(routine);
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    await this.processRoutine(action);
    await this.exec();
  }

  public async list(): Promise<RoutineDTO[]> {
    return await this.fetchService.fetch({
      url: `/routine`,
    });
  }

  public async processRoutine(routine: RoutineDTO): Promise<void> {
    //
  }
}
