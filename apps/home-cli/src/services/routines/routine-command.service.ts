import {
  RoomEntitySaveStateDTO,
  ROUTINE_ACTIVATE_COMMAND,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
} from '@ccontour/controller-logic';
import { DONE, ICONS, PromptEntry, PromptService } from '@ccontour/tty';
import { IsEmpty, TitleCase } from '@ccontour/utilities';
import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { dump } from 'js-yaml';
import { v4 as uuid } from 'uuid';

import { EntityService } from '../entity.service';
import { GroupStateService } from '../groups';
import { RoomCommandService, RoomStateService } from '../rooms';
import { SendNotificationService, WebhookService } from './command';
import { GroupActionService } from './group-action.service';
import { RoutineService } from './routine.service';

type RService = RoutineService;
type RSService = RoomStateService;
type RCService = RoomCommandService;

@Injectable()
export class RoutineCommandService {
  constructor(
    private readonly promptService: PromptService,
    private readonly groupAction: GroupActionService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RService,
    @Inject(forwardRef(() => RoomStateService))
    private readonly roomState: RSService,
    private readonly groupState: GroupStateService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
    private readonly entityCommand: EntityService,
    private readonly sendNotification: SendNotificationService,
    private readonly webhookService: WebhookService,
  ) {}

  public async build(
    routine: RoutineDTO,
    current: Partial<RoutineCommandDTO> = {},
  ): Promise<RoutineCommandDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_COMMAND>(
      `Command type`,
      Object.values(ROUTINE_ACTIVATE_COMMAND).map((value) => [
        TitleCase(value),
        value,
      ]),
      current.type,
    );
    const room = await this.roomCommand.get(routine.room);
    room.save_states ??= [];
    switch (type) {
      case ROUTINE_ACTIVATE_COMMAND.webhook:
        return {
          command: await this.webhookService.build(
            current.command as RoutineCommandWebhookDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.entity_state:
        return {
          command: await this.entityCommand.createSaveCommand(
            await this.entityCommand.pickOne(
              undefined,
              (current.command as RoomEntitySaveStateDTO)?.ref,
            ),
            current.command as RoomEntitySaveStateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.group_action:
        return {
          command: await this.groupAction.build(
            current.command as RoutineCommandGroupActionDTO,
            room.groups,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        return {
          command: await this.groupState.buildState(
            room,
            current?.command as RoutineCommandGroupStateDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        const state = await this.roomState.pickOne(
          room,
          room.save_states.find(
            ({ id }) =>
              id === (current?.command as RoutineCommandRoomStateDTO)?.state,
          ),
        );
        return {
          command: {
            room: room._id,
            state: state,
          } as RoutineCommandRoomStateDTO,
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.send_notification:
        return {
          command: await this.sendNotification.build(
            current.command as RoutineCommandSendNotificationDTO,
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
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        [`${ICONS.EDIT}Edit`, 'edit'],
        [`${ICONS.DELETE}Delete`, 'delete'],
      ],
      `Routine command actions`,
    );
    switch (action) {
      case DONE:
        return routine;
      case 'describe':
        this.promptService.print(dump(command));
        return await this.process(
          routine,
          routine.command.find(({ id }) => id === command.id),
        );
      case 'edit':
        const updated = await this.build(routine, command);
        routine.command = routine.command.map((i) =>
          i.id === command.id ? { ...updated, id: i.id } : i,
        );
        routine = await this.routineCommand.update(routine);
        return await this.process(
          routine,
          routine.command.find(({ id }) => id === command.id),
        );
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${command.friendlyName}? This cannot be undone`,
          ))
        ) {
          return await this.process(routine, command);
        }
        routine.command = routine.command.filter(({ id }) => id !== command.id);
        routine = await this.routineCommand.update(routine);
        return routine;
    }
  }

  public async processRoutine(routine: RoutineDTO): Promise<RoutineDTO> {
    routine.command ??= [];
    const action = await this.promptService.menuSelect(
      [
        [`${ICONS.CREATE}Add`, 'add'],
        ...this.promptService.conditionalEntries(!IsEmpty(routine.command), [
          new inquirer.Separator(chalk.white`Current commands`),
          ...(routine.command.map((activate) => [
            activate.friendlyName,
            activate,
          ]) as PromptEntry<RoutineCommandDTO>[]),
        ]),
      ],
      `Routine commands`,
    );
    switch (action) {
      case DONE:
        return routine;
      case 'add':
        const command = await this.build(routine);
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
