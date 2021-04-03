import { HassEvents } from './enums/socket';
import { HassStateDTO } from './hass-state.dto';

export class EventDataDTO {
  // #region Object Properties

  entity_id?: string;
  event?: number;
  id?: string;
  new_state?: HassStateDTO | unknown;
  old_state?: HassStateDTO | unknown;

  // #endregion Object Properties
}

export class ContextDTO {
  // #region Object Properties

  public id: string;
  public parent_id: string;
  public user_id: string;

  // #endregion Object Properties
}

export class HassEventDTO {
  // #region Object Properties

  public context: ContextDTO;
  public data: EventDataDTO;
  public event_type: HassEvents;
  public origin: 'local';
  public time_fired: Date;

  // #endregion Object Properties
}
