import { ResponseLocals } from '@automagical/contracts';
import { APIResponse } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Locals = createParamDecorator(
  (locals: ResponseLocals, context: ExecutionContext): ResponseLocals => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return locals ?? response.locals;
  },
);
