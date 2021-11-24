import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsObject, ValidateNested } from 'class-validator';

import { ContextDTO } from './hass-event.dto';

export class HassStateDTO<
  STATE extends unknown = unknown,
  ATTRIBUTES extends Record<never, unknown> = { friendly_name?: string },
> {
  @ApiProperty()
  @IsObject()
  public attributes: ATTRIBUTES;
  @ApiProperty({ type: ContextDTO })
  @ValidateNested()
  public context: ContextDTO;
  @ApiProperty()
  public entity_id: string;
  @ApiProperty()
  @IsDate()
  public last_changed: Date;
  @IsDate()
  @ApiProperty()
  public last_updated: Date;
  @ApiProperty({ type: 'string' })
  public state: STATE;
}
