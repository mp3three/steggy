import { FetchUser } from '@automagical/formio-sdk';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { HasLicenseGuard } from '../guards/has-license.guard';
import { FetchLicenseMiddleware } from '../middleware/fetch-license.middleware';

/**
 * Load the licenses, reject w/ unauthorized if failed
 *
 * Implies @FetchUser (@automagical/formio-sdk)
 */
export function FetchLicense(): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    FetchUser(),
    UsePipes(FetchLicenseMiddleware),
    UseGuards(HasLicenseGuard),
  );
}

export const License = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse();
    return response.locals.license;
  },
);
export const AllLicenses = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse();
    return response.locals.licenses;
  },
);

export const LicenseId = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const response = context.switchToHttp().getResponse();
    return response.locals.licenseId;
  },
);
