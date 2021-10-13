import { LightingCacheDTO } from '../dto';

export class RoomEntitySaveStateDTO {
  entity_id: string;
  extra?: LightingCacheDTO | Record<string, unknown>;
  state: string;
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
  groups?: Record<string, 'turnOn' | 'turnOff' | string>;
  id?: string;
  /**
   * Name of save state
   */
  name: string;
}
