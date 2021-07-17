import { CrudOptions } from '../interfaces/crud-options';
import { ResultControlDTO } from '../libs/fetch';
import { FormDTO } from '../libs/formio-sdk';

export interface FormCRUD {
  // #region Public Methods

  create(form: FormDTO, options: CrudOptions): Promise<FormDTO>;
  delete(form: FormDTO | string, options: CrudOptions): Promise<boolean>;
  findById(form: string, options: CrudOptions): Promise<FormDTO>;
  findByName(form: string, options: CrudOptions): Promise<FormDTO>;
  findMany(query: ResultControlDTO, options: CrudOptions): Promise<FormDTO[]>;
  update(form: FormDTO, options: CrudOptions): Promise<FormDTO>;

  // #endregion Public Methods
}
export const FormCRUD = Symbol('FormCRUD');
export type iFormCRUD = FormCRUD;
