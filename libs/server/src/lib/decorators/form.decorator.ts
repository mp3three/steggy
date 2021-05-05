import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UsePipes,
} from '@nestjs/common';

import { LoadFormMiddleware } from '../middleware';

export function FetchForm(): ReturnType<typeof applyDecorators> {
  return applyDecorators(FetchForm(), UsePipes(LoadFormMiddleware));
}

export const Form = createParamDecorator(
  (data: SubmissionDTO, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse();
    /**
     * ? Is data a provided value that I am trying to override?
     */
    return data || response.locals.form;
  },
);
