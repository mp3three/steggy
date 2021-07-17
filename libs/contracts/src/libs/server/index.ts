import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';

import { ResponseLocals, StandardParameters } from '../../interfaces';

type EmptyObject = Record<never, unknown>;

/**
 * Properties that make workflow changes
 */
class GenericBody {
  // #region Object Properties

  /**
   * Identifies this as a "WIP" submission
   */
  draft?: boolean;

  // #endregion Object Properties
}

/**
 * Known query params that aren't control related
 */
class GenericQuery {
  // #region Object Properties

  /**
   * License server
   */
  licenseKey?: string;
  live?: boolean;
  /**
   * Super secret "bypass validation" flag
   */
  noValidate?: boolean;

  // #endregion Object Properties
}
/**
 * Wrapper around express' request type info
 *
 * Also attaches APIResponse type info to request.res
 */
export type APIRequest<
  RequestBody extends EmptyObject = GenericBody,
  Query extends EmptyObject = GenericQuery,
> = Request<StandardParameters, unknown, RequestBody, Query, ResponseLocals>;
export const APIRequest = REQUEST;
/**
 * Alias that contains the standard set of response locals.
 */
export type APIResponse<ResponseBody extends EmptyObject = EmptyObject> =
  Response<ResponseBody, ResponseLocals>;
export const APIResponse = REQUEST;
export * from './headers';
export * from './metadata';
export * from './project-export-details.dto';
export * from './reserved-words';
export * from './status.dto';
export * from './team-project-list.dto';
export * from './team-project-permission.dto';
