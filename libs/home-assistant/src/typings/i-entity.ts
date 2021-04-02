import { HassStateDTO } from '@automagical/contracts';
import * as dayjs from 'dayjs';
import { HassDomains, HassServices } from './socket';

type f = (...args: unknown[]) => void;

export interface iEntity {
  // #region Object Properties

  attributes: Record<string, unknown>;
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
  setState(state: HassStateDTO): Promise<void>;

  // #endregion Public Methods
}
