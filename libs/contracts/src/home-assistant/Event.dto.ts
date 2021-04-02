import { HassStateDTO } from '.';
import { HassEvents } from './enums/socket';

export class EventDataDTO {
  // #region Object Properties

  entity_id?: string;
  event?: number;
  id?: string;
  new_state?: HassStateDTO;
  old_state?: HassStateDTO;

  // #endregion Object Properties
}

export class ContextDTO {
  // #region Object Properties

  public id: string;
  public parent_id: string;
  public user_id: string;

  // #endregion Object Properties
}

export class EventDTO {
  // #region Object Properties

  public context: ContextDTO;
  public data: EventDataDTO;
  public event_type: HassEvents;
  public origin: 'local';
  public time_fired: Date;

  // #endregion Object Properties
}
