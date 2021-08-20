import dayjs from 'dayjs';
import { Types } from 'mongoose';

export type Identifier = { _id?: string; name?: string };
export type IdentifierWithParent = Partial<{ parent: string } & Identifier>;
export type Timestamp = string;

export type FetchAuth = {
  /**
   * Project API Key
   */
  apiKey?: string;
  /**
   * Temp Auth Token
   */
  jwtToken?: string;
  /**
   * Temporary auth token
   */
  tempAuthToken?: TemporaryAuthToken;
  /**
   * Server admin key
   */
  adminKey?: string;
  /**
   * Bearer token
   */
  bearer?: string;
};

export type FetchArguments = FetchAuth & {
  /**
   * Frequently filled in by wrapper services
   */
  baseUrl?: string;
  /**
   * POSTDATA
   */
  body?: unknown;
  /**
   * Formatted filters to send with request. Gets translated to query params
   */
  control?: ResultControlDTO;
  /**
   * Headers to append
   */
  headers?: Record<string, unknown>;
  /**
   * Which HTTP method?
   */
  method?: HTTP_METHODS | STRING_HTTP;
  /**
   * Query params to send
   */
  params?: Record<string, string>;
  /**
   * Built in post-processing
   */
  process?: boolean | 'text';
  /**
   * true for "this is not a url relative to portal base"
   */
  rawUrl?: boolean;
  /**
   * URL to send request to
   */
  url: string;
};

/**
 * Same thing as FetchWith, but the function doesn't need any args
 *
 * This is a work around, for some reason the default value approach isn't work as I had hoped
 */
export type BaseFetch = Partial<FetchArguments>;

export type TemporaryAuthToken = {
  token?: string;
  key: string;
};

export type FilterValueType =
  | string
  | boolean
  | number
  | Date
  | dayjs.Dayjs
  | RegExp
  | Types.ObjectId
  | Record<string, string>;

export class FilterDTO {
  // #region Object Properties

  public exists?: boolean;
  /**
   * Dot notation object path, from object root
   */
  public field?: string;
  public operation?: FILTER_OPERATIONS;
  public value?: FilterValueType | FilterValueType[];

  // #endregion Object Properties
}

export class ResultControlDTO {
  // #region Object Properties

  public filters?: Set<FilterDTO>;
  public limit?: number;
  public select?: string[];
  public skip?: number;
  public sort?: string[];

  // #endregion Object Properties
}

export enum FILTER_OPERATIONS {
  regex = 'regex',
  in = 'in',
  nin = 'nin',
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
  ne = 'ne',
  eq = 'eq',
  // "elemMatch" functionality in mongo
  // eslint-disable-next-line unicorn/prevent-abbreviations
  elem = 'elem',
}

export enum HTTP_METHODS {
  get = 'get',
  delete = 'delete',
  put = 'put',
  options = 'options',
  patch = 'patch',
  index = 'index',
  post = 'post',
}
type STRING_HTTP = `${HTTP_METHODS}`;

export type FetchWith<T extends Record<never, string> = Record<never, string>> =
  Partial<FetchArguments> & T;
