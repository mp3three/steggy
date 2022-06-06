import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import {
  GeneralSaveStateDTO,
  GroupDTO,
  RoomDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import {
  IsDone,
  PromptService,
  ScreenService,
  TextRenderingService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { dump } from 'js-yaml';

import { MENU_ITEMS } from '../../includes';
import { GroupCommandService } from '../groups';
import { RoomCommandService } from '../rooms';
import { RoutineService } from './routine.service';

type RService = RoutineService;
type RCService = RoomCommandService;

@Injectable()
export class RoutineCommandService {
  constructor(
    private readonly textRender: TextRenderingService,
    private readonly groupCommand: GroupCommandService,
    private readonly screenService: ScreenService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineCommand: RService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomCommand: RCService,
  ) {}

  public async commandDetails(
    routine: RoutineDTO,
    current: RoutineCommandDTO,
  ): Promise<string> {
    let room: RoomDTO | string;
    let group: GroupDTO;
    switch (current.type) {
      case 'trigger_routine':
        const triggerCommand =
          current.command as RoutineCommandTriggerRoutineDTO;
        const triggerRoutine = await this.routineCommand.get(
          triggerCommand.routine,
        );
        return chalk`{bold Routine:} ${triggerRoutine.friendlyName}`;
      case 'sleep':
        return this.textRender.typePrinter(current.command);
      case 'send_notification':
        return this.textRender.typePrinter(current.command);
      case 'room_state':
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
      case 'webhook':
        const webhook = current.command as RoutineCommandWebhookDTO;
        return [
          chalk`{bold Method:} ${webhook.method}`,
          chalk`{bold Target:} ${webhook.url}`,
        ].join(`\n`);
      case 'entity_state':
        const entityState = current.command as GeneralSaveStateDTO;
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
      case 'group_action':
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
      case 'group_state':
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
        // s: [`${ICONS.SWAP}Sort`, 'sort'],
      },
      right: ToMenuEntry(
        routine.command.map(activate => [activate.friendlyName, activate]),
      ),
      rightHeader: `Routine commands`,
    });
    if (IsDone(action)) {
      return routine;
    }
    // if (action === 'sort') {
    //   routine = await this.sort(routine);
    //   return await this.processRoutine(routine);
    // }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    routine = await this.process(routine, action);
    return await this.processRoutine(routine);
  }

  // private async sort(routine: RoutineDTO): Promise<RoutineDTO> {
  //   const entries = routine.command.map(i => [
  //     i.friendlyName,
  //     i,
  //   ]) as PromptEntry<RoomCommandDTO>[];
  //   const move = await this.promptService.pickOne(
  //     `Pick item to move`,
  //     ToMenuEntry(entries),
  //   );
  //   const position = await this.promptService.insertPosition(entries, move);
  //   const before = routine.command
  //     .slice(START, position)
  //     .filter(i => i !== move);
  //   const after = routine.command.slice(position).filter(i => i !== move);
  //   routine.command = [...before, move, ...after] as RoutineCommandDTO[];
  //   return await this.routineCommand.update(routine);
  // }
}
