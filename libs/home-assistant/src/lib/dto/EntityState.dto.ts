import * as dayjs from 'dayjs';
import { ContextDTO } from './Event.dto';

export class EntityStateDTO {}

export class HassStateDTO<T extends EntityStateDTO = EntityStateDTO> {
  // #region Object Properties

  public attributes: Record<string, unknown>;
  public context: ContextDTO;
  public entity_id: string;
  public last_changed: dayjs.Dayjs;
  public last_updated: dayjs.Dayjs;
  public state: T;

  // #endregion Object Properties
}
