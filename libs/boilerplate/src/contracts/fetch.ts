import { ResultControlDTO } from '@automagical/utilities';
import chalk from 'chalk';

export type FetchAuth = {
  /**
   * Server admin key
   */
  adminKey?: string;
  /**
   * Project API Key
   */
  apiKey?: string;
  /**
   * Bearer token
   */
  bearer?: string;
  /**
   * Temp Auth Token
   */
  jwtToken?: string;
};

export type FetchParameterTypes =
  | string
  | boolean
  | Date
  | number
  | Array<string | Date | number>;

export type FetchArguments<BODY extends unknown = unknown> = FetchAuth & {
  /**
   * Frequently filled in by wrapper services
   */
  baseUrl?: string;
  /**
   * POSTDATA
   */
  body?: BODY;
  /**
   * Formatted filters to send with request. Gets translated to & merged with query params
   */
  control?: ResultControlDTO;
  /**
   * Headers to append
   */
  headers?: Record<string, unknown>;
  /**
   * Which HTTP method?
   */
  method?: HTTP_METHODS | `${HTTP_METHODS}`;
  /**
   * Query params to send
   */
  params?: Record<string, FetchParameterTypes>;
  /**
   * Built in post-processing
   *
   * - true = attempt to decode as json
   * - false = return the node-fetch response object without processing
   * - 'text' = return result as text, no additional processing
   */
  process?: boolean | 'text';
  /**
   * URL is the full path (includes http://...)
   *
   * Ignores baseUrl if set
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

// Related logic:
//  - JSONFilterService
//  - mongo persistence
export enum FILTER_OPERATIONS {
  // "elemMatch" functionality in mongo
  // eslint-disable-next-line unicorn/prevent-abbreviations
  elem = 'elem',
  regex = 'regex',
  in = 'in',
  nin = 'nin',
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
  ne = 'ne',
  eq = 'eq',
}
const dateMessage = [
  `Compare 2 things relative to each other.`,
  `Numbers are `,
].join(`\n`);
export const FILTER_OPERATIONS_HELP = new Map<FILTER_OPERATIONS, string>([
  [
    FILTER_OPERATIONS.eq,
    [
      chalk`Attempt to compare 2 values for equality. Values will be coerced to {yellow number} / {magenta boolean} / {gray null} as needed`,
      ` `,
      chalk` {cyan -} {blue y/true} = {magenta true}`,
      chalk` {cyan -} {blue n/false} = {magenta false}`,
    ].join(`\n`),
  ],
  [FILTER_OPERATIONS.gt, dateMessage],
  [
    FILTER_OPERATIONS.ne,
    [chalk`Attempt to compare 2 values inequality`].join(`\n`),
  ],
  [
    FILTER_OPERATIONS.regex,
    [chalk`Does the property conform to a regular expression?`].join(`\n`),
  ],
  [
    FILTER_OPERATIONS.elem,
    [
      chalk`{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue kitten}`,
      chalk`{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue vulture}`,
    ].join(`\n`),
  ],
]);

export enum HTTP_METHODS {
  get = 'get',
  delete = 'delete',
  put = 'put',
  head = 'head',
  options = 'options',
  patch = 'patch',
  index = 'index',
  post = 'post',
}

export type FetchWith<
  T extends Record<never, string> = Record<never, string>,
  BODY extends unknown = unknown,
> = Partial<FetchArguments<BODY>> & T;
