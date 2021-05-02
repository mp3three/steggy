import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

import { HasUserGuard } from '../guards/has-user.guard';

export function FetchUser(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    UsePipes(),
    UseGuards(HasUserGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse();
    /**
     * ? Is data a provided value that I am trying to override?
     */
    return data || response.locals.user;
  },
);
