import {
  FetchAuth,
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/utilities';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';

type EmptyObject = Record<never, unknown>;
/**
 * Wrapper around express' request type info
 *
 * Also attaches APIResponse type info to request.res
 */
export type APIRequest<
  RequestBody extends EmptyObject = EmptyObject,
  Query extends EmptyObject = EmptyObject,
> = Request<unknown, unknown, RequestBody, Query, ResponseLocals>;
export const APIRequest = REQUEST;
/**
 * Alias that contains the standard set of response locals.
 */
export type APIResponse<ResponseBody extends EmptyObject = EmptyObject> =
  Response<ResponseBody, ResponseLocals>;
export const APIResponse = REQUEST;

export class CrudOptions {
  auth?: FetchAuth;
  control?: ResultControlDTO;
}

export interface ResponseLocals extends CrudOptions {
  /**
   * Did one of the auth guards say no?
   */
  authenticated?: boolean;
  flags: Set<string>;
  /**
   * Form loaded via path params
   */
  headers: Map<string, string>;
  method: HTTP_METHODS;
  parameters: Map<string, string>;
  query: Map<string, string>;
  roles: Set<string>;
}
