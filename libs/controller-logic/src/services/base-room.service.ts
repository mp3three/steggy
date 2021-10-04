import { Injectable } from '@nestjs/common';

import {
  ROOM_CONTROLLER_SETTINGS,
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '../contracts';

@Injectable()
export class BaseRoomService {
  public get settings(): RoomControllerSettingsDTO {
    return this.constructor[ROOM_CONTROLLER_SETTINGS];
  }
  protected commandScope(command?: RoomCommandDTO): Set<RoomCommandScope> {
    command ??= {};
    command.scope ??= [];
    command.scope = Array.isArray(command.scope)
      ? command.scope
      : [command.scope];
    return new Set(command.scope);
  }
}
