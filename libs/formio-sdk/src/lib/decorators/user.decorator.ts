import {
  ,
  MetadataTypes,
} from '@automagical/formio-sdk';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HasUserGuard } from '../guards/has-user.guard';

export function FetchUser() {
  return applyDecorators(
    UsePipes(),
    UseGuards(HasUserGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    /**
     * ? Is data a provided value that I am trying to override?
     */
    return data || response.locals.user;
  },
);
