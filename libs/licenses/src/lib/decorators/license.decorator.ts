import { FetchUser, FetchUserdataMiddleware } from '@automagical/formio-sdk';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HasLicenseGuard } from '../guards/has-license.guard';
import { FetchLicenseMiddleware } from '../middleware/fetch-license.middleware';

/**
 * Load the licenses, reject w/ unauthorized if failed
 *
 * Implies @FetchUser (@automagical/formio-sdk)
 */
export function FetchLicense() {
  return applyDecorators(
    FetchUser(),
    UsePipes(FetchLicenseMiddleware),
    UseGuards(HasLicenseGuard),
  );
}

export const License = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    return response.locals.licenses;
  },
);
