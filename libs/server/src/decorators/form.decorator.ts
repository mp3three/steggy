import { FormDTO } from '@formio/contracts/formio-sdk';
import { APIResponse } from '@formio/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Form = createParamDecorator(
  (data: FormDTO, context: ExecutionContext): FormDTO => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return data ?? response.locals.form;
  },
);
