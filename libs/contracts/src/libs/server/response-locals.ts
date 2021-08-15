import { FetchAuth, HTTP_METHODS, ResultControlDTO } from '../utilities';

export enum ResponseFlags {}
export class LocalStashDTO {
  // #region Object Properties

  public body?: unknown;

  // #endregion Object Properties
}

export class CrudOptions {
  // #region Object Properties

  auth?: FetchAuth;
  control?: ResultControlDTO;

  // #endregion Object Properties
}

export interface ResponseLocals extends CrudOptions {
  // #region Object Properties

  /**
   * Did one of the auth guards say no?
   */
  authenticated?: boolean;
  flags: Set<ResponseFlags>;
  /**
   * Form loaded via path params
   */
  headers: Map<string, string>;
  licenseId?: string;
  method: HTTP_METHODS;
  parameters: Map<string, string>;
  query: Map<string, string>;
  stash?: LocalStashDTO[];

  // #endregion Object Properties
}
