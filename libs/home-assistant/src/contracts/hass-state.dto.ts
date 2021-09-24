import dayjs from 'dayjs';

import { ContextDTO } from './hass-event.dto';

export class HassStateDTO<
  STATE extends unknown = unknown,
  ATTRIBUTES extends Record<never, unknown> = { friendly_name?: string },
> {
  public attributes: ATTRIBUTES;
  public context: ContextDTO;
  public entity_id: string;
  public last_changed: dayjs.Dayjs;
  public last_updated: dayjs.Dayjs;
  public state: STATE;
}
