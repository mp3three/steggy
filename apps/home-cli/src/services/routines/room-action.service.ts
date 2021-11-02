import {
  GENERIC_COMMANDS,
  RoomDTO,
  RoutineCommandRoomActionDTO,
} from '@automagical/controller-logic';
import { PromptEntry, PromptService } from '@automagical/tty';
import { IsEmpty } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

import { GroupCommandService } from '../groups';
import { RoomCommandService } from '../rooms';

const GenericCommands = [
  ['turnOn', 'turnOn'],
  ['turnOff', 'turnOff'],
  ['dimUp', 'dimUp'],
  ['dimDown', 'dimDown'],
  ['setBrightness', 'setBrightness'],
  ['circadianOn', 'circadianOn'],
] as PromptEntry<GENERIC_COMMANDS>[];

export class RoomActionExtraDTO {
  entities?: string[];
}

const MINIMUM_ENTITIES = 0;
@Injectable()
export class RoomActionService {
  constructor(
    private readonly promptService: PromptService,
    private readonly groupCommand: GroupCommandService,
    private readonly roomService: RoomCommandService,
  ) {}

  public async build(
    current: Partial<RoutineCommandRoomActionDTO> = {},
  ): Promise<RoutineCommandRoomActionDTO> {
    current.room = await this.roomService.pickOne(current.room);
    current.command = await this.promptService.pickOne(
      `Command`,
      GenericCommands,
      current.command,
    );
    switch (current.command) {
      case 'dimUp':
      case 'dimDown':
        if (!(await this.promptService.confirm(`Use default dim amount?`))) {
          current.brightness = await this.promptService.number(
            `Change amount (1-255)`,
          );
        }
        break;
      case 'turnOn':
      case 'circadianOn':
        if (!(await this.promptService.confirm(`Change brightness?`))) {
          break;
        }
      // fall through
      case 'setBrightness':
        current.brightness = await this.promptService.number(
          `Brightness target (1-255)`,
        );
        break;
    }
    current.entities = await this.pickEntities(current.room, current.entities);
    current.groups = await this.pickGroups(current.room, current.groups);
    return current as RoutineCommandRoomActionDTO;
  }

  private async pickEntities(
    room: RoomDTO,
    current: string[],
  ): Promise<string[]> {
    const action = await this.promptService.pickOne(
      `Which entities`,
      [
        ['All entities', 'all'],
        ['Manual list', 'manual'],
      ],
      IsEmpty(current) ? 'all' : 'manual',
    );
    if (action === 'all') {
      return [];
    }
    console.log(chalk.blue` > Empty list = everything`);
    return await this.promptService.pickMany(
      `Pick from entities`,
      room.entities.map((entity) => [entity.entity_id, entity.entity_id]),
      { default: current, min: MINIMUM_ENTITIES },
    );
  }

  private async pickGroups(
    room: RoomDTO,
    current: string[],
  ): Promise<string[]> {
    const groups = await this.groupCommand.pickMany(room.groups, current);
    return groups.map(({ _id }) => _id);
  }
}
