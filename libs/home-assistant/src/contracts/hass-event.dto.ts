import { HassEvents } from './enums/socket';
import { HassStateDTO } from './hass-state.dto';

export class EventDataDTO<
  STATE extends Record<never, unknown> = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  entity_id?: string;
  event?: number;
  id?: string;
  new_state?: HassStateDTO<STATE, ATTRIBUTES>;
  old_state?: HassStateDTO<STATE, ATTRIBUTES> | unknown;
}

export class ContextDTO {
  public id: string;
  public parent_id: string;
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
  public time_fired: Date;
}
