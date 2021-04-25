import dayjs from 'dayjs';
import { HomeAssistantEntityAttributes } from './entity-attributes.dto';
import { ContextDTO } from './hass-event.dto';

export class HassStateDTO<
  STATE extends Record<never, unknown> = Record<never, unknown>,
  ATTRIBUTES extends Record<never, unknown> = HomeAssistantEntityAttributes
> {
  // #region Object Properties

  public attributes: ATTRIBUTES;
  public context: ContextDTO;
  public entity_id: string;
  public last_changed: dayjs.Dayjs;
  public last_updated: dayjs.Dayjs;
  public state: STATE;

  // #endregion Object Properties
}
