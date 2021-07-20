import { FormDTO, ProjectDTO } from '../libs/formio-sdk';
import { FetchAuth, ResultControlDTO } from '../libs/utilities/fetch';

export class CrudOptions {
  // #region Object Properties

  auth?: FetchAuth;
  control?: ResultControlDTO;
  form?: FormDTO;
  project?: ProjectDTO;

  // #endregion Object Properties
}
