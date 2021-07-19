import { HassEvents } from './enums/socket';
import { HassStateDTO } from './hass-state.dto';

export class EventDataDTO<
  STATE extends Record<never, unknown> = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  // #region Object Properties

  entity_id?: string;
  event?: number;
  id?: string;
  new_state?: HassStateDTO<STATE, ATTRIBUTES>;
  old_state?: HassStateDTO<STATE, ATTRIBUTES> | unknown;

  // #endregion Object Properties
}

export class ContextDTO {
  // #region Object Properties

  public id: string;
  public parent_id: string;
  public user_id: string;

  // #endregion Object Properties
}

export class HassEventDTO<
  STATE extends Record<never, unknown> = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  // #region Object Properties

  public context: ContextDTO;
  public data: EventDataDTO<STATE, ATTRIBUTES>;
  public event_type: HassEvents;
  public origin: 'local';
  public time_fired: Date;

  // #endregion Object Properties
}
