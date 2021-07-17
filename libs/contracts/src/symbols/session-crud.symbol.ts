import { ResultControlDTO } from '../libs/fetch';
import { SessionDTO } from '../libs/formio-sdk';

export interface SessionCRUD {
  // #region Public Methods

  create(session: SessionDTO): Promise<SessionDTO>;
  findById(session: string, control?: ResultControlDTO): Promise<SessionDTO>;
  update(source: SessionDTO): Promise<SessionDTO>;

  // #endregion Public Methods
}
export const SessionCRUD = Symbol('SessionCRUD');
export type iSessionCRUD = SessionCRUD;
