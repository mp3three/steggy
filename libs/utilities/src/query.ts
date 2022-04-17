import { is } from './is';

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

export type FilterValueType =
  | string
  | boolean
  | number
  | Date
  | RegExp
  | unknown
  | Record<string, string>;

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
  exists = 'exists',
  ne = 'ne',
  eq = 'eq',
}

export class ComparisonDTO {
  public operation?: FILTER_OPERATIONS | `${FILTER_OPERATIONS}`;
  public value?: FilterValueType | FilterValueType[];
}

export class FilterDTO extends ComparisonDTO {
  public exists?: boolean;
  public field?: string;
}

export class ResultControlDTO {
  public filters?: Set<FilterDTO>;
  public limit?: number;
  public select?: string[];
  public skip?: number;
  public sort?: string[];
}

export function controlToQuery(
  value: Readonly<ResultControlDTO>,
): Record<string, string> {
  const out = new Map<string, string>();
  if (value?.limit) {
    out.set('limit', value.limit.toString());
  }
  if (value?.skip) {
    out.set('skip', value.skip.toString());
  }
  if (value?.sort) {
    out.set('sort', value.sort.join(','));
  }
  if (value?.select) {
    out.set('select', value.select.join(','));
  }
  value?.filters?.forEach(f => {
    let field = f.field;
    if (f.operation && f.operation !== FILTER_OPERATIONS.eq) {
      field = `${field}__${f.operation}`;
    }
    let value = f.value;
    if (Array.isArray(value)) {
      value = value.join(',');
    }
    if (value instanceof Date) {
      value = value.toISOString();
    }
    if (value === null) {
      value = 'null';
    }
    out.set(field, (value ?? '').toString());
  });
  return Object.fromEntries(out.entries());
}

export function buildFilter(
  key: string,
  value: FilterValueType | FilterValueType[],
): FilterDTO {
  const [name, operation] = key.split('__') as [string, FILTER_OPERATIONS];
  switch (operation) {
    case 'in':
    case 'nin':
      if (!Array.isArray(value)) {
        value = is.string(value) ? value.split(',') : [value];
      }
      return {
        field: name,
        operation,
        value: value,
      };
    case 'elem':
      return {
        field: name,
        operation,
        value: is.string(value) ? JSON.parse(value) : value,
      };
    default:
      return {
        field: name,
        operation,
        value,
      };
  }
}

export function queryToControl(
  value: Readonly<Record<string, string>>,
): ResultControlDTO {
  const out: ResultControlDTO = {
    filters: new Set(),
  };
  const parameters = new Map<string, string>(Object.entries(value));
  parameters.forEach((value, key) => {
    const [name, operation] = key.split('__') as [string, FILTER_OPERATIONS];
    switch (key) {
      case 'select':
        out.select = value.split(',');
        return;
      case 'sort':
        out.sort = value.split(',');
        return;
      case 'limit':
        out.limit = Number(value);
        return;
      case 'skip':
        out.skip = Number(value);
        return;
    }
    switch (operation) {
      case 'in':
      case 'nin':
        out.filters.add({
          field: name,
          operation,
          value: value.split(','),
        });
        return;
      case 'elem':
        out.filters.add({
          field: name,
          operation,
          value: JSON.parse(value),
        });
        return;
      default:
        out.filters.add({
          field: name,
          operation,
          value,
        });
    }
  });
  return out;
}
