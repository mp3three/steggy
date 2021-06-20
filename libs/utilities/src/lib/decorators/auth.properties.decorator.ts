import { API_KEY_HEADER, JWT_HEADER } from '@automagical/contracts/constants';
import { FetchAuth } from '@automagical/contracts/fetch';
import { APIRequest } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthProperties = createParamDecorator(
  (data: FetchAuth, context: ExecutionContext): FetchAuth => {
    const request: APIRequest = context.switchToHttp().getRequest();
    return (
      data ?? {
        apiKey: request.header(API_KEY_HEADER),
        jwtToken: request.header(JWT_HEADER),
      }
    );
  },
);
