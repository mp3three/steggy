import {
  GENERIC_COMMANDS,
  RoutineCommandRoomActionDTO,
} from '@automagical/controller-logic';
import { PromptEntry, PromptService } from '@automagical/tty';
import { Injectable } from '@nestjs/common';

import { RoomCommandService } from '../rooms/room-command.service';

const GenericCommands = [
  ['turnOn', 'turnOn'],
  ['turnOff', 'turnOff'],
  ['dimUp', 'dimUp'],
  ['dimDown', 'dimDown'],
  ['setBrightness', 'setBrightness'],
  ['circadianOn', 'circadianOn'],
] as PromptEntry<GENERIC_COMMANDS>[];

@Injectable()
export class RoomActionService {
  constructor(
    private readonly promptService: PromptService,
    private readonly roomService: RoomCommandService,
  ) {}

  public async build(
    current?: RoutineCommandRoomActionDTO,
  ): Promise<RoutineCommandRoomActionDTO> {
    const room = await this.roomService.pickOne(current.room);

    const command = await this.promptService.pickOne(
      `Command`,
      GenericCommands,
      current?.command,
    );

    const list: string[] = [];
    room.entities ??= [];
    room.entities.forEach(({ tags }) => list.push(...tags));
    const uniqueTags = list.filter(
      (item, index, array) => array.indexOf(item) === index,
    );
    const action = await this.promptService.pickOne(``, [
      ['All entities', 'all'],
      ['Tagged entities', 'tags'],
      ['Domains', 'domain'],
      ['Manual list', 'manual'],
    ]);

    return undefined;
  }
}
