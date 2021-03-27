import {
  FetchUserdataMiddleware,
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
    UsePipes(FetchUserdataMiddleware),
    UseGuards(HasUserGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    return response.locals.user;
  },
);
