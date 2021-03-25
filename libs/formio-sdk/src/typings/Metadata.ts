import { SetMetadata } from '@nestjs/common';
import { LicenseScopes } from '../dto';

export const UseUtilization = (
  type: 'formRequest' | 'submissionRequest' | LicenseScopes,
) => SetMetadata('licenseUtilization', type);
