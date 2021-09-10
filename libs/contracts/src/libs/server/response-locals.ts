import { FetchAuth, HTTP_METHODS, ResultControlDTO } from '../utilities';

export enum ResponseFlags {}
export class LocalStashDTO {
  public body?: unknown;
}

export class CrudOptions {
  auth?: FetchAuth;
  control?: ResultControlDTO;
}

export interface ResponseLocals extends CrudOptions {
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
}
