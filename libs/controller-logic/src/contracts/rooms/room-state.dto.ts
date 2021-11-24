import { ApiProperty } from '@nestjs/swagger';

import { ClimateCacheDTO, FanCacheDTO, LightingCacheDTO } from '../dto';

export enum LIGHTING_MODE {
  circadian = 'circadian',
  on = 'on',
}

export class RoomStateDTO {
  @ApiProperty()
  public friendlyName: string;
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public states: RoomEntitySaveStateDTO[];
  @ApiProperty({ required: false })
  public tags?: string[];
}

export type ROOM_ENTITY_EXTRAS =
  | LightingCacheDTO
  | FanCacheDTO
  | ClimateCacheDTO;

export class RoomEntitySaveStateDTO<EXTRA = ROOM_ENTITY_EXTRAS> {
  public extra?: EXTRA;
  public ref: string;
  public state: string;
  public type?: 'group' | 'entity';
}
