import { CrudOptions } from '../interfaces/crud-options';
import { ResultControlDTO } from '../libs/fetch';
import { ActionDTO } from '../libs/formio-sdk';

export interface ActionCRUD {
  // #region Public Methods

  create(action: ActionDTO, options: CrudOptions): Promise<ActionDTO>;
  delete(action: ActionDTO | string, options: CrudOptions): Promise<boolean>;
  findById(action: string, options: CrudOptions): Promise<ActionDTO>;
  findMany(query: ResultControlDTO, options: CrudOptions): Promise<ActionDTO[]>;
  update(source: ActionDTO, options: CrudOptions): Promise<ActionDTO>;

  // #endregion Public Methods
}
export type iActionCRUD = ActionCRUD;
export const ActionCRUD = Symbol('ActionCRUD');
