import { RoomEntitySaveStateDTO } from '../rooms';
import { GroupDTO, RoomDTO } from '../schemas';

export enum ROUTINE_ACTIVATE_COMMAND {
  room_state = 'room_state',
  group_state = 'group_state',
  group_action = 'group_action',
  entity_state = 'entity_state',
  send_notification = 'send_notification',
}

export type GENERIC_COMMANDS =
  | 'turnOn'
  | 'turnOff'
  | 'dimUp'
  | 'dimDown'
  | 'setBrightness'
  | 'circadianOn';

export class RoutineCommandDTO<
  COMMAND =
    | RoutineCommandGroupActionDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandSendNotificationDTO
    | RoomEntitySaveStateDTO
    | RoutineCommandGroupStateDTO,
> {
  public command: COMMAND;
  public friendlyName: string;
  public id?: string;
  public type: ROUTINE_ACTIVATE_COMMAND;
}

export class RoutineCommandRoomActionDTO {
  public brightness: number;
  public command: Omit<GENERIC_COMMANDS, 'turnOn'>;
  public entities: string[];
  public groups: string[];
  public room: string | RoomDTO;
}

export class RoutineCommandRoomStateDTO {
  public room: string | RoomDTO;
  public state: string;
}

export class RoutineCommandGroupStateDTO {
  public group: string | GroupDTO;
  public state: string;
}

export class RoutineCommandGroupActionDTO {
  public command: GENERIC_COMMANDS;
  public extra?: Record<string, unknown>;
  public group: string | GroupDTO;
}

export class RoutineCommandSendNotificationDTO {
  public template: string;
}
