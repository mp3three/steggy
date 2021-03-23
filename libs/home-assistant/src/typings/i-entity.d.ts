import * as dayjs from 'dayjs';
import { EntityStateDTO } from '../lib/dto';
import { HassDomains, HassServices } from './socket';

type f = (...args: unknown[]) => void;

export interface iEntity {
  // #region Object Properties

  attributes: Dictionary<unknown>;
  domain: HassDomains;
  entityId: string;
  friendlyName: string;
  lastChanged: dayjs.Dayjs;
  lastUpdated: dayjs.Dayjs;
  state: unknown;

  // #endregion Object Properties

  // #region Public Methods

  call(service: HassServices, args?: Record<string, unknown>): Promise<void>;
  getWarnings(): Promise<string[]>;
  on(evt: string, cb: f);
  onNextChange(): Promise<void>;
  setState(state: EntityStateDTO): Promise<void>;

  // #endregion Public Methods
}
