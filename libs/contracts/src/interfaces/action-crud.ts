import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionDTO, FormDTO } from '@automagical/contracts/formio-sdk';

export interface ActionCRUD {
  // #region Public Methods

  create(action: Omit<ActionDTO, 'form'>, form: FormDTO): Promise<ActionDTO>;
  delete(action: ActionDTO | string, form: FormDTO): Promise<boolean>;
  findById(
    action: string,
    form: FormDTO,
    query?: ResultControlDTO,
  ): Promise<ActionDTO>;
  findMany(query: ResultControlDTO, form: FormDTO): Promise<ActionDTO[]>;
  update(source: ActionDTO, form: FormDTO): Promise<ActionDTO>;

  // #endregion Public Methods
}
export const ActionCRUD = Symbol('ActionCRUD');
