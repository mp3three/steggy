import { FetchAuth, ResultControlDTO } from '../libs/fetch';
import { FormDTO, ProjectDTO } from '../libs/formio-sdk';

export class CrudOptions {
  // #region Object Properties

  auth?: FetchAuth;
  control?: ResultControlDTO;
  form?: FormDTO;
  project?: ProjectDTO;

  // #endregion Object Properties
}
