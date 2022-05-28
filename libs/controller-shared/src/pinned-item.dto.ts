import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type PIN_TYPES = `${PinTypes}`;

enum PinTypes {
  group = 'group',
  entity = 'entity',
  room = 'room',
  routine = 'routine',
  person = 'person',
  group_state = 'group_state',
  person_state = 'person_state',
  room_state = 'room_state',
}

export class PinnedItemDTO {
  @ApiProperty()
  @IsString()
  public target: string;
  @ApiProperty()
  @IsString()
  public type: PIN_TYPES;
}
