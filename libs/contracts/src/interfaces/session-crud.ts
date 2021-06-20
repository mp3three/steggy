import { ResultControlDTO } from '@automagical/contracts/fetch';
import { SessionDTO } from '@automagical/contracts/formio-sdk';

export interface SessionCRUD {
  // #region Public Methods

  create(session: SessionDTO): Promise<SessionDTO>;
  findById(session: string, control?: ResultControlDTO): Promise<SessionDTO>;
  update(source: SessionDTO): Promise<SessionDTO>;

  // #endregion Public Methods
}
export const SessionCRUD = Symbol('SessionCRUD');
