import { GroupDTO, RoomDTO } from '../schemas';

export enum ROUTINE_ACTIVATE_COMMAND {
  room_state = 'room_state',
  group_state = 'group_state',
  room_action = 'room_action',
  group_action = 'group_action',
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
    | RoutineCommandRoomActionDTO
    | RoutineCommandGroupActionDTO
    | RoutineCommandRoomStateDTO
    | RoutineCommandGroupStateDTO,
> {
  public command: COMMAND;
  public friendlyName: string;
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
