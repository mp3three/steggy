import dayjs from 'dayjs';

export type Identifier = { _id?: string; name?: string };
export type IdentifierWithParent = Partial<{ parent: string } & Identifier>;
export type Timestamp = string;

export enum HTTP_Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export interface FetchArguments {
  // #region Object Properties

  /**
   * Project API Key
   */
  apiKey?: string;
  /**
   * By default, it goes to portal base. Maybe you need the license server
   */
  baseUrl?: string;
  /**
   * POSTDATA
   */
  body?: unknown;
  /**
   * Equivelent to #/body/data
   *
   * Shorthand since a lot of requests look for data attribute
   *
   * If both body and data are provided, a best attempt at merging is done. Don't expect miracles, use body if you want to be 100% sure
   */
  data?: Record<string, unknown>;
  /**
   * Formatted filters to send with request. Gets translated to query params
   */
  filters?: Filters[];
  /**
   * Additional headers to send
   */
  headers?: Record<string, unknown>;
  /**
   * Which HTTP method?
   */
  method?: HTTP_Methods;
  /**
   * Query params to send
   */
  params?: Record<string, string>;
  /**
   * false = "just return back the text"
   *
   * true = "give me back the response object, and bypass postprocessing"
   */
  process?: boolean;
  /**
   * true for "this is not a url relative to portal base"
   */
  rawUrl?: boolean;
  /**
   * Temporary auth token
   */
  tempAuthToken?: TemporaryAuthToken;
  /**
   * Temp Auth Token
   */
  token?: string;
  /**
   * URL to send request to
   */
  url: string;

  // #endregion Object Properties
}
// export type FetchArguments = Readonly<iFetchArguments>;

/**
 * Constructs an object that can optionally accept params destined for fetch(), but also named params for this intermediate call
 */
export type FetchWith<
  T extends Record<never, string> = Record<never, string>
> = Partial<FetchArguments> & T;

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

type filterValue = string | number | Date | dayjs.Dayjs;

export type Filters = {
  field?: string;
  equals?: filterValue;
  ne?: filterValue;
  gt?: filterValue;
  sort?: string | string[];
  lt?: filterValue;
  lte?: filterValue;
  in?: filterValue | filterValue[];
  nin?: filterValue | filterValue[];
  exists?: boolean;
  regex?: string | RegExp;
  limit?: number;
  skip?: number;
  select?: string | string[];
};
