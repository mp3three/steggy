import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import dayjs from 'dayjs';

// export type Identifier = { _id?: string; name?: string };
// export type IdentifierWithParent = Partial<{ parent: string } & Identifier>;

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
  params?: Record<string, string>;
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

export type FilterValueType =
  | string
  | boolean
  | number
  | Date
  | dayjs.Dayjs
  | RegExp
  | unknown
  | Record<string, string>;

export class ComparisonDTO {
  @IsOptional()
  @IsEnum(FILTER_OPERATIONS)
  @ApiProperty({ required: false })
  public operation?: FILTER_OPERATIONS;
  @IsOptional()
  @ApiProperty({ required: false })
  public value?: FilterValueType | FilterValueType[];
}

export class FilterDTO extends ComparisonDTO {
  @IsBoolean()
  @ApiProperty({ required: false })
  public exists?: boolean;
  /**
   * Dot notation object path, from object root
   */
  @ApiProperty({ required: false })
  @IsString()
  public field?: string;
}

export class ResultControlDTO {
  public filters?: Set<FilterDTO>;
  public limit?: number;
  public select?: string[];
  public skip?: number;
  public sort?: string[];
}

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
