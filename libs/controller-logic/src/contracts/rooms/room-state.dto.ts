import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';

import { ClimateCacheDTO, FanCacheDTO, LightingCacheDTO } from '../dto';

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

export const ENTITY_EXTRAS_SCHEMA = {
  oneOf: [
    { $ref: `#/components/schemas/LightingCacheDTO` },
    { $ref: `#/components/schemas/${FanCacheDTO.name}` },
    { $ref: `#/components/schemas/${ClimateCacheDTO.name}` },
  ],
};

export class RoomEntitySaveStateDTO<EXTRA = ROOM_ENTITY_EXTRAS> {
  @ValidateNested()
  @ApiProperty(ENTITY_EXTRAS_SCHEMA)
  public extra?: EXTRA;
  @IsString()
  @ApiProperty()
  public ref: string;
  @IsString()
  @ApiProperty()
  public state: string;
  @IsString()
  @ApiProperty()
  public type?: 'group' | 'entity';
}
