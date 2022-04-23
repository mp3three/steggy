import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { HassEvents } from './enums/socket';
import { HassStateDTO } from './hass-state.dto';

export class EventDataDTO<
  STATE extends Record<never, unknown> = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  public entity_id?: string;
  public event?: number;
  public id?: string;
  public new_state?: HassStateDTO<STATE, ATTRIBUTES>;
  public old_state?: HassStateDTO<STATE, ATTRIBUTES> | unknown;
}

export class ContextDTO {
  @IsString()
  @ApiProperty()
  public id: string;
  @IsString()
  @ApiProperty()
  public parent_id: string;
  @IsString()
  @ApiProperty()
  public user_id: string;
}

export class HassEventDTO<
  STATE extends Record<never, unknown> = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  public context: ContextDTO;
  public data: EventDataDTO<STATE, ATTRIBUTES>;
  public event_type: HassEvents;
  public origin: 'local';
  public result?: string;
  public time_fired: Date;
  public variables: Record<string, unknown>;
}
