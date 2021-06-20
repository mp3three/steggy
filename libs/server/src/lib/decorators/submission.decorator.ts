import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Submission = createParamDecorator(
  (data: SubmissionDTO, context: ExecutionContext): SubmissionDTO => {
    const response: APIResponse = context.switchToHttp().getResponse();
    return data ?? response.locals.submission;
  },
);
