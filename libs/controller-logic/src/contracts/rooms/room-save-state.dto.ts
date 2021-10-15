export class RoomEntitySaveStateDTO<
  T extends unknown = Record<string, unknown>,
> {
  entity_id: string;
  extra?: T;
  state: string;
}

export class RoomGroupSaveStateDTO {
  action: string;
  extra?: Record<string, unknown>;
  group: string;
}

export class RoomSaveStateDTO {
  /**
   * Describe the state of every active entity
   */
  entities?: RoomEntitySaveStateDTO[];
  /**
   * How the groups should react.
   * Must be a valid action for the group, or a valid state id for the group
   */
  groups?: RoomGroupSaveStateDTO[];
  id?: string;
  /**
   * Name of save state
   */
  name: string;
}
