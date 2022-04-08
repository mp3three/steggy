import { ApiProperty } from '@nestjs/swagger';
import {
  FanAttributesDTO,
  LightAttributesDTO,
  LockAttributesDTO,
  SwitchAttributesDTO,
} from '@steggy/home-assistant-shared';
import { IsString, ValidateNested } from 'class-validator';

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
  | LightAttributesDTO
  | FanAttributesDTO
  | SwitchAttributesDTO
  | LockAttributesDTO;

export const ENTITY_EXTRAS_SCHEMA = {
  oneOf: [
    { $ref: `#/components/schemas/${LightAttributesDTO.name}` },
    { $ref: `#/components/schemas/${FanAttributesDTO.name}` },
    { $ref: `#/components/schemas/${SwitchAttributesDTO.name}` },
    { $ref: `#/components/schemas/${LockAttributesDTO.name}` },
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
  public state?: string;
  @IsString()
  @ApiProperty()
  public type?: 'group' | 'entity';
}
