import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { LoadFormMiddleware } from '@automagical/formio-sdk';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UsePipes,
} from '@nestjs/common';

export function FetchForm(): ReturnType<typeof applyDecorators> {
  return applyDecorators(FetchForm(), UsePipes(LoadFormMiddleware));
}

export const Form = createParamDecorator(
  (data: SubmissionDTO, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    /**
     * ? Is data a provided value that I am trying to override?
     */
    return data || response.locals.form;
  },
);
