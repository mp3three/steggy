import * as dayjs from 'dayjs';
import { HomeAssistantEntityAttributes } from './entity-attributes.dto';
import { ContextDTO } from './hass-event.dto';

export class HassStateDTO<
  T extends Record<never, unknown> = Record<never, unknown>
> {
  // #region Object Properties

  public attributes: HomeAssistantEntityAttributes;
  public context: ContextDTO;
  public entity_id: string;
  public last_changed: dayjs.Dayjs;
  public last_updated: dayjs.Dayjs;
  public state: T;

  // #endregion Object Properties
}
