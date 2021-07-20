import {
  API_KEY_HEADER,
  APIRequest,
  APIResponse,
  JWT_HEADER,
} from '@automagical/contracts/server';
import { FetchAuth } from '@automagical/contracts/utilities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthProperties = createParamDecorator(
  (data: FetchAuth, context: ExecutionContext): FetchAuth => {
    const request: APIRequest = context.switchToHttp().getRequest();
    const { locals }: APIResponse = request.res;
    return (
      data ?? {
        apiKey: request.header(API_KEY_HEADER) || locals?.projectApiKey,
        jwtToken: request.header(JWT_HEADER),
      }
    );
  },
);
