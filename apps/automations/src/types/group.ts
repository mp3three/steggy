export enum GROUP_TYPES {
  light = 'light',
  fan = 'fan',
  switch = 'switch',
  lock = 'lock',
}
export enum LIGHTING_MODE {
  circadian = 'circadian',
  on = 'on',
}
export class FanCacheDTO {
  public speed: string;
}

export class LightingCacheDTO {
  public brightness?: number;
  public hs_color?: [number, number] | number[];
  public kelvin?: number;
  public mode?: LIGHTING_MODE;
  public rgb_color?: [number, number, number] | number[];
}
export type ROOM_ENTITY_EXTRAS = LightingCacheDTO | FanCacheDTO;
export class RoomEntitySaveStateDTO<EXTRA = ROOM_ENTITY_EXTRAS> {
  public extra?: EXTRA;
  public ref: string;
  public state: string;
  public type?: 'group' | 'entity';
}

export class GroupDTO<
  GROUP_STATE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
> {
  public _id?: string;
  public created?: Date;
  public deleted?: number;

  public entities: string[];
  public friendlyName: string;

  public modified?: Date;

  public save_states?: GroupSaveStateDTO<GROUP_STATE>[];

  public state?: Pick<GroupSaveStateDTO, 'states'>;

  public type: GROUP_TYPES;
}

export class GroupSaveStateDTO<SAVE_STATE = ROOM_ENTITY_EXTRAS> {
  public friendlyName: string;

  public id?: string;

  public states: RoomEntitySaveStateDTO<SAVE_STATE>[];
}
