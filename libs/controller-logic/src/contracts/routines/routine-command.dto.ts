export enum ROUTINE_ACTIVATE_COMMAND {
  room_state = 'room_state',
  group_state = 'group_state',
  room_action = 'room_action',
  group_action = 'group_action',
}

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
  public command:
    | 'turnOn'
    | 'turnOff'
    | 'dimUp'
    | 'dimDown'
    | 'setBrightness'
    | 'circadianOn';
  public extra?: Record<string, unknown>;
  public room: string;
  public tags: string[];
}

export class RoutineCommandRoomStateDTO {
  public room: string;
  public state: string;
}

export class RoutineCommandGroupStateDTO {
  public group: string;
  public state: string;
}

export class RoutineCommandGroupActionDTO {
  public command:
    | 'turnOn'
    | 'turnOff'
    | 'dimUp'
    | 'dimDown'
    | 'setBrightness'
    | 'circadianOn';
  public extra?: Record<string, unknown>;
  public group: string;
}
