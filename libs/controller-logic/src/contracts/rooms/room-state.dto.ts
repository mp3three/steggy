import { ClimateCacheDTO, FanCacheDTO, LightingCacheDTO } from '../dto';

export enum LIGHTING_MODE {
  circadian = 'circadian',
  on = 'on',
}

export class RoomStateDTO {
  public friendlyName: string;
  public id: string;
  public states: RoomEntitySaveStateDTO[];
  public tags?: string[];
}

export type ROOM_ENTITY_EXTRAS =
  | LightingCacheDTO
  | FanCacheDTO
  | ClimateCacheDTO;

export class RoomEntitySaveStateDTO<EXTRA = ROOM_ENTITY_EXTRAS> {
  public ref: string;
  public extra?: EXTRA;
  public state: string;
  public type?: 'group' | 'room';
}
