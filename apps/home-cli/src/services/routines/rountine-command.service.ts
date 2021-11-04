import {
  ROUTINE_ACTIVATE_COMMAND,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineDTO,
} from '@automagical/controller-logic';
import { DONE, PromptEntry, PromptService } from '@automagical/tty';
import { IsEmpty, TitleCase } from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import inquirer from 'inquirer';
import { v4 as uuid } from 'uuid';

import { ICONS } from '../../typings';
import { GroupStateService } from '../groups';
import { RoomStateService } from '../rooms';
import { GroupActionService } from './group-action.service';
import { RoutineService } from './routine.service';

@Injectable()
export class RoutineCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly groupAction: GroupActionService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RoutineService,
    @Inject(forwardRef(() => RoomStateService))
    private readonly roomState: RoomStateService,
    private readonly groupState: GroupStateService,
  ) {}

  public async build(
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
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        return {
          command: await this.roomState.loadBuild(
            current?.command as RoutineCommandRoomStateDTO,
          ),
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async process(
    routine: RoutineDTO,
    command: RoutineCommandDTO,
  ): Promise<RoutineDTO> {
    const action = await this.promptService.menuSelect([
      [`${ICONS.DELETE}Remove`, 'remove'],
      [`${ICONS.EDIT}Edit`, 'edit'],
    ]);
    switch (action) {
      case DONE:
        return routine;
      case 'edit':
        const updated = await this.build(command);
        routine.command = routine.command.map((i) =>
          i.id === command.id ? { ...updated, id: i.id } : i,
        );
        routine = await this.routineCommand.update(routine);
        return await this.process(
          routine,
          routine.command.find(({ id }) => id === command.id),
        );
      case 'remove':
        routine.activate = routine.activate.filter(
          ({ id }) => id !== command.id,
        );
        routine = await this.routineCommand.update(routine);
        return await this.process(
          routine,
          routine.command.find(({ id }) => id === command.id),
        );
    }
  }

  public async processRoutine(routine: RoutineDTO): Promise<RoutineDTO> {
    routine.command ??= [];
    const action = await this.promptService.menuSelect([
      [`${ICONS.CREATE}Add`, 'add'],
      ...this.promptService.conditionalEntries(!IsEmpty(routine.activate), [
        new inquirer.Separator(),
        ...(routine.command.map((activate) => [
          activate.friendlyName,
          activate,
        ]) as PromptEntry<RoutineCommandDTO>[]),
      ]),
    ]);
    switch (action) {
      case DONE:
        return routine;
      case 'add':
        const command = await this.build();
        command.id = uuid();
        routine.command.push(command);
        routine = await this.routineCommand.update(routine);
        return await this.processRoutine(routine);
    }
    if (typeof action === 'string') {
      throw new NotImplementedException();
    }
    routine = await this.process(routine, action);
    return await this.processRoutine(routine);
  }
}
