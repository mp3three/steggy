import { ActionDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Action = createParamDecorator(
  (data: ActionDTO, context: ExecutionContext): ActionDTO => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return data ?? response.locals.action;
  },
);
