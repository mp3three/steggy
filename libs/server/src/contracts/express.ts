import { AutoLogService } from '@automagical/boilerplate';
import {
  FetchAuth,
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/utilities';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';
import pino from 'pino';

export enum ResponseFlags {
  ADMIN_KEY,
  ADMIN,
}

type EmptyObject = Record<never, unknown>;
/**
 * Wrapper around express' request type info
 *
 * Also attaches APIResponse type info to request.res
 */
export type APIRequest<
  RequestBody extends EmptyObject = EmptyObject,
  Query extends EmptyObject = EmptyObject,
> = Request<unknown, unknown, RequestBody, Query, ResponseLocals> & {
  logger: AutoLogService;
};
export const APIRequest = REQUEST;
/**
 * Alias that contains the standard set of response locals.
 */
export type APIResponse<
  BODY extends EmptyObject = EmptyObject,
  LOCALS = ResponseLocals,
> = Response<BODY, LOCALS>;
export const APIResponse = REQUEST;

export class CrudOptions {
  auth?: FetchAuth;
  control?: ResultControlDTO;
}

export class ResponseLocals extends CrudOptions {
  /**
   * Did one of the auth guards say no?
   */
  authenticated?: boolean;
  flags?: Set<ResponseFlags>;
  /**
   * Form loaded via path params
   */
  headers?: Map<string, string>;
  logger?: pino.Logger;
  method?: HTTP_METHODS;
  parameters?: Map<string, string>;
  query?: Map<string, string>;
  roles?: Set<string>;
  start?: Date;
}
