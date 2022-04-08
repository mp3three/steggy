import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import {
  GroupDTO,
  RoomCommandDTO,
  RoomDTO,
  RoomEntitySaveStateDTO,
  RountineCommandLightFlashDTO,
  ROUTINE_ACTIVATE_COMMAND,
  RoutineCaptureCommandDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  RoutineRestoreCommandDTO,
} from '@steggy/controller-shared';
import {
  ICONS,
  IsDone,
  PromptEntry,
  PromptService,
  ScreenService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, START, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { dump } from 'js-yaml';
import { v4 as uuid } from 'uuid';

import { MENU_ITEMS } from '../../includes';
import { GroupCommandService, GroupStateService } from '../groups';
import { EntityService } from '../home-assistant/entity.service';
import { RoomCommandService, RoomStateService } from '../rooms';
import {
  LightFlashService,
  RestoreService,
  RoutineCaptureService,
  RoutineTriggerService,
  SendNotificationService,
  WebhookService,
} from './command';
import { GroupActionService } from './group-action.service';
import { RoutineService } from './routine.service';

type RService = RoutineService;
type RSService = RoomStateService;
type RCService = RoomCommandService;

@Injectable()
export class RoutineCommandService {
  constructor(
    private readonly entityCommand: EntityService,
    private readonly flashAnimation: LightFlashService,
    private readonly groupAction: GroupActionService,
    private readonly textRender: TextRenderingService,
    private readonly groupCommand: GroupCommandService,
    private readonly screenService: ScreenService,
    private readonly groupState: GroupStateService,
    private readonly captureService: RoutineCaptureService,
    private readonly restoreService: RestoreService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RService,
    @Inject(forwardRef(() => RoomStateService))
    private readonly roomState: RSService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
    @Inject(forwardRef(() => SendNotificationService))
    private readonly sendNotification: SendNotificationService,
    @Inject(forwardRef(() => WebhookService))
    private readonly webhookService: WebhookService,
    @Inject(forwardRef(() => RoutineTriggerService))
    private readonly routineTrigger: RoutineTriggerService,
  ) {}

  public async build(
    routine: RoutineDTO,
    current: Partial<RoutineCommandDTO> = {},
  ): Promise<RoutineCommandDTO> {
    const friendlyName = await this.promptService.string(
      `Friendly name`,
      current.friendlyName,
    );
    let room: RoomDTO;
    if (routine.room) {
      room = await this.roomCommand.get(routine.room);
      room.save_states ??= [];
    }
    const type = await this.promptService.pickOne<ROUTINE_ACTIVATE_COMMAND>(
      `Command type`,
      Object.values(ROUTINE_ACTIVATE_COMMAND)
        .filter(i => (room ? true : !i.includes('room')))
        .map(value => [TitleCase(value), value]),
      current.type,
    );
    switch (type) {
      case ROUTINE_ACTIVATE_COMMAND.restore_state:
        return {
          command: await this.restoreService.build(
            current as RoutineRestoreCommandDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.capture_state:
        return {
          command: await this.captureService.build(
            current as RoutineCaptureCommandDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.trigger_routine:
        return {
          command: await this.routineTrigger.build(
            current.command as RoutineCommandTriggerRoutineDTO,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.light_flash:
        return {
          command: await this.flashAnimation.build(
            current.command as RountineCommandLightFlashDTO,
          ),
          friendlyName,
          type,
        };
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
            room?.groups,
          ),
          friendlyName,
          type,
        };
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        return {
          command: await this.groupState.buildState(
            current?.command as RoutineCommandGroupStateDTO,
            room,
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
      case ROUTINE_ACTIVATE_COMMAND.sleep:
        return {
          command: {
            duration: await this.promptService.number(
              `Duration (ms)`,
              (current?.command as RoutineCommandSleepDTO)?.duration,
            ),
          } as RoutineCommandSleepDTO,
          friendlyName,
          type,
        };
    }
    throw new NotImplementedException();
  }

  public async commandDetails(
    routine: RoutineDTO,
    current: RoutineCommandDTO,
  ): Promise<string> {
    let room: RoomDTO | string;
    let group: GroupDTO;
    switch (current.type) {
      case ROUTINE_ACTIVATE_COMMAND.trigger_routine:
        const triggerCommand =
          current.command as RoutineCommandTriggerRoutineDTO;
        const triggerRoutine = await this.routineCommand.get(
          triggerCommand.routine,
        );
        return chalk`{bold Routine:} ${triggerRoutine.friendlyName}`;
      case ROUTINE_ACTIVATE_COMMAND.sleep:
        return this.textRender.typePrinter(current.command);
      case ROUTINE_ACTIVATE_COMMAND.send_notification:
        return this.textRender.typePrinter(current.command);
      case ROUTINE_ACTIVATE_COMMAND.room_state:
        const roomStateCommand = (current?.command ??
          {}) as RoutineCommandRoomStateDTO;
        room = await this.roomCommand.get(
          is.string(roomStateCommand.room)
            ? roomStateCommand.room
            : roomStateCommand.room._id,
        );
        return [
          chalk`{bold Room: } ${(room as RoomDTO).friendlyName}`,
          chalk`{bold State:} ${
            (room as RoomDTO).save_states.find(
              ({ id }) => id === roomStateCommand.state,
            )?.friendlyName
          }`,
        ].join(`\n`);
      case ROUTINE_ACTIVATE_COMMAND.light_flash:
        const { ref, type, ...lightFlashCommand } =
          current.command as RountineCommandLightFlashDTO;
        return [
          type === 'entity'
            ? chalk`{bold Entity:} ${ref}`
            : chalk`{bold Group:} ${
                (await this.groupCommand.get(ref))?.friendlyName
              }`,
          this.textRender.typePrinter(lightFlashCommand),
        ].join(`\n`);
      case ROUTINE_ACTIVATE_COMMAND.webhook:
        const webhook = current.command as RoutineCommandWebhookDTO;
        return [
          chalk`{bold Method:} ${webhook.method}`,
          chalk`{bold Target:} ${webhook.url}`,
        ].join(`\n`);
      case ROUTINE_ACTIVATE_COMMAND.entity_state:
        const entityState = current.command as RoomEntitySaveStateDTO;
        return [
          chalk`{bold Entity:} ${entityState.ref}`,
          chalk`{bold State:} ${entityState.state}`,
          ...(entityState.extra
            ? Object.keys(entityState.extra).map(
                key =>
                  chalk`{bold ${TitleCase(key)}:} ${entityState.extra[key]}`,
              )
            : []),
        ].join(`\n`);
      case ROUTINE_ACTIVATE_COMMAND.group_action:
        const groupActionCommand =
          current.command as RoutineCommandGroupActionDTO;
        group = await this.groupCommand.get(groupActionCommand.group);
        return [
          chalk`{bold Group:}   ${group.friendlyName}`,
          chalk`{bold Command:} ${groupActionCommand.command}`,
          ...Object.keys(groupActionCommand.extra ?? {}).map(
            key =>
              chalk`{bold ${TitleCase(key)}:} ${groupActionCommand.extra[key]}`,
          ),
        ].join(`\n`);
      case ROUTINE_ACTIVATE_COMMAND.group_state:
        const groupStateCommand =
          current.command as RoutineCommandGroupStateDTO;
        group = await this.groupCommand.get(groupStateCommand.group);
        return [
          chalk`{bold Group:} ${group.friendlyName}`,
          chalk`{bold State:} ${
            group.save_states.find(({ id }) => id === groupStateCommand.state)
              .friendlyName
          }`,
        ].join(`\n`);
    }
    return dump(current.command);
  }

  public async process(
    routine: RoutineDTO,
    command: RoutineCommandDTO,
  ): Promise<RoutineDTO> {
    const action = await this.promptService.menu({
      keyMap: {
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.EDIT,
        x: MENU_ITEMS.DELETE,
      },
    });
    if (IsDone(action)) {
      return routine;
    }
    switch (action) {
      case 'describe':
        this.screenService.print(dump(command));
        return await this.process(
          routine,
          routine.command.find(({ id }) => id === command.id),
        );
      case 'edit':
        const updated = await this.build(routine, command);
        routine.command = routine.command.map(i =>
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
    const action = await this.promptService.menu({
      hideSearch: true,
      item: 'commands',
      keyMap: {
        d: MENU_ITEMS.DONE,
        s: [`${ICONS.SWAP}Sort`, 'sort'],
      },
      right: ToMenuEntry(
        routine.command.map(activate => [activate.friendlyName, activate]),
      ),
      rightHeader: `Routine commands`,
    });
    if (IsDone(action)) {
      return routine;
    }
    switch (action) {
      case 'sort':
        routine = await this.sort(routine);
        return await this.processRoutine(routine);
      case 'add':
        const command = await this.build(routine);
        command.id = uuid();
        routine.command.push(command);
        routine = await this.routineCommand.update(routine);
        return await this.processRoutine(routine);
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    routine = await this.process(routine, action);
    return await this.processRoutine(routine);
  }

  private async sort(routine: RoutineDTO): Promise<RoutineDTO> {
    const entries = routine.command.map(i => [
      i.friendlyName,
      i,
    ]) as PromptEntry<RoomCommandDTO>[];
    const move = await this.promptService.pickOne(`Pick item to move`, entries);
    const position = await this.promptService.insertPosition(entries, move);
    const before = routine.command
      .slice(START, position)
      .filter(i => i !== move);
    const after = routine.command.slice(position).filter(i => i !== move);
    routine.command = [...before, move, ...after] as RoutineCommandDTO[];
    return await this.routineCommand.update(routine);
  }
}
