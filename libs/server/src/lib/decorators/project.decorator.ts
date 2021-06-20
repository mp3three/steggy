import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { APIResponse } from '@automagical/contracts/server';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Project = createParamDecorator(
  (data: ProjectDTO, context: ExecutionContext): ProjectDTO => {
    const { locals }: APIResponse = context.switchToHttp().getResponse();
    return data ?? locals.project;
  },
);
