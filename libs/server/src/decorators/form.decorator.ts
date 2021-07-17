import { FormDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Form = createParamDecorator(
  (data: FormDTO, context: ExecutionContext): FormDTO => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return data ?? response.locals.form;
  },
);
