import { FetchAuth } from '@formio/contracts/fetch';
import {
  API_KEY_HEADER,
  APIRequest,
  JWT_HEADER,
} from '@formio/contracts/server';
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
