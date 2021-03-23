import { EntityStateDTO } from '.';
import { HassEvents } from '../typings';

export class EventDataDTO {
  // #region Object Properties

  entity_id?: string;
  event?: number;
  id?: string;
  new_state?: EntityStateDTO;
  old_state?: EntityStateDTO;

  // #endregion Object Properties
}

export class EventDTO {
  // #region Object Properties

  public context: EventContextDTO;
  public event_type: HassEvents;
  public origin: 'local';
  public time_fired: Date;

  // #endregion Object Properties
}

export class EventContextDTO {
  // #region Object Properties

  public id: string;
  public parent_id: string;
  public user_id: string;

  // #endregion Object Properties
}
