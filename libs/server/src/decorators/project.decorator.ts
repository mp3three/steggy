import { ProjectDTO } from '@formio/contracts/formio-sdk';
import { APIResponse } from '@formio/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Project = createParamDecorator(
  (data: ProjectDTO, context: ExecutionContext): ProjectDTO => {
    const { locals }: APIResponse = context.switchToHttp().getResponse();
    return data ?? locals.project;
  },
);
