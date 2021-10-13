import { LightingCacheDTO } from '../dto';

export class RoomEntitySaveStateDTO {
  extra?: LightingCacheDTO | Record<string, unknown>;
  id: string;
  state: string;
}

export class RoomSaveStateDTO {
  /**
   * Describe the state of every active entity
   */
  entities?: RoomEntitySaveStateDTO[];
  /**
   * How the groups should react
   */
  groups?: Record<string, 'turnOn' | 'turnOff' | string>;
  id: string;
  /**
   * Name of save state
   */
  name: string;
}
