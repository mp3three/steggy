import {
  KunamiCodeActivateDTO,
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineDTO,
  ROUTINE_ACTIVATE_COMMAND,
  ROUTINE_ACTIVATE_TYPE,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService, Repl } from '@automagical/tty';
import { IsEmpty, TitleCase } from '@automagical/utilities';
import { NotImplementedException } from '@nestjs/common';
import inquirer from 'inquirer';
import { ICONS } from '../../typings';
import { GroupStateService } from '../groups';
import { HomeFetchService } from '../home-fetch.service';
import { GroupActionService } from './group-action.service';
import { KunamiBuilderService } from './kunami-builder.service';
import { ScheduleBuilderService } from './schedule-builder.service';
import { StateChangeBuilderService } from './state-change-builder.service';

@Repl({
  description: [`Control rooms and groups based on state changes and schdules`],
  icon: ICONS.ROUTINE,
  name: `Routines`,
  category: 'Control',
})
export class RoutineCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly kunamiActivate: KunamiBuilderService,
    private readonly stateActivate: StateChangeBuilderService,
    private readonly fetchService: HomeFetchService,
    private readonly schduleActivate: ScheduleBuilderService,
    private readonly groupAction: GroupActionService,
    private readonly groupState: GroupStateService,
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
          type,
          friendlyName,
          activate: await this.schduleActivate.build(
            current.activate as ScheduleActivateDTO,
          ),
        };
    }
    throw new NotImplementedException();
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
          friendlyName,
          type,
          command: await this.groupAction.build(
            current.command as RoutineCommandGroupActionDTO,
          ),
        };
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        const { group, state } =
          current?.command as RoutineCommandGroupStateDTO;
        return {
          friendlyName,
          type,
          command: await this.groupState.pickOne(group, state),
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
    const action = await this.promptService.menuSelect(
      [
        ['Create', 'create'],
        ...this.promptService.conditionalEntries(!IsEmpty(current), [
          new inquirer.Separator(),
          ...(current.map((item) => [
            item.friendlyName,
            item,
          ]) as PromptEntry<RoutineDTO>[]),
        ]),
      ],
      undefined,
    );
    if (action === DONE) {
      return;
    }
    if (action === 'create') {
      const routine = await this.build();
      await this.fetchService.fetch({
        url: `/routine`,
        method: `post`,
      });
      await this.exec();
      return;
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
