import { ResultControlDTO } from '../libs/fetch';
import { ActionItemDTO, FormDTO } from '../libs/formio-sdk';

export interface ActionItemCRUD {
  // #region Public Methods

  create(action: ActionItemDTO, form: FormDTO): Promise<ActionItemDTO>;
  delete(
    action: ActionItemDTO | string,
    form: FormDTO | string,
  ): Promise<boolean>;
  findById(
    action: string,
    form: FormDTO | string,
    query?: ResultControlDTO,
  ): Promise<ActionItemDTO>;
  findMany(
    query: ResultControlDTO,
    form: FormDTO | string,
  ): Promise<ActionItemDTO[]>;
  update(source: ActionItemDTO, form: FormDTO): Promise<ActionItemDTO>;

  // #endregion Public Methods
}
export type iActionItemCRUD = ActionItemCRUD;
export const ActionItemCRUD = Symbol('ActionItemCRUD');
