import { ResultControlDTO } from '@automagical/contracts/fetch';
import { APIRequest } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Control = createParamDecorator(
  (data: ResultControlDTO, context: ExecutionContext): ResultControlDTO => {
    const request = context.switchToHttp().getRequest<APIRequest>();
    return data ?? request.res.locals.control;
  },
);
