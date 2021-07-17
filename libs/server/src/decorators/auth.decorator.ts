import { FetchAuth } from '@formio/contracts/fetch';
import { APIResponse } from '@formio/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * FetchAuth
 */
export const Auth = createParamDecorator(
  (data: FetchAuth, context: ExecutionContext): FetchAuth => {
    const { locals }: APIResponse = context.switchToHttp().getResponse();
    return data ?? locals.auth;
  },
);
