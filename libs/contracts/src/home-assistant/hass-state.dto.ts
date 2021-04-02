import * as dayjs from 'dayjs';
import { ContextDTO } from './hass-event.dto';

export class HassStateDTO<
  T extends Record<never, unknown> = Record<never, unknown>
> {
  // #region Object Properties

  public attributes: Record<string, unknown>;
  public context: ContextDTO;
  public entity_id: string;
  public last_changed: dayjs.Dayjs;
  public last_updated: dayjs.Dayjs;
  public state: T;

  // #endregion Object Properties
}
