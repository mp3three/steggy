import { ActionDTO } from '@formio/contracts/formio-sdk';
import { APIResponse } from '@formio/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Action = createParamDecorator(
  (data: ActionDTO, context: ExecutionContext): ActionDTO => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return data ?? response.locals.action;
  },
);
