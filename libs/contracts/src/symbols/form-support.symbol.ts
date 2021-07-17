import { CrudOptions } from '../interfaces/crud-options';
import { FormDTO } from '../libs/formio-sdk';

export interface FormSupport {
  // #region Public Methods

  getRevision(revision: string, options: CrudOptions): Promise<unknown>;
  listRevisions(form: FormDTO, options: CrudOptions): Promise<unknown>;
  swagger(options: CrudOptions): Promise<unknown>;

  // #endregion Public Methods
}
export const FormSupport = Symbol('FormSupport');
export type iFormSupport = FormSupport;
