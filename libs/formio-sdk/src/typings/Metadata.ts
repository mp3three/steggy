import { SetMetadata } from '@nestjs/common';
import { LicenseScopes } from '@automagical/contracts';

export enum MetadataTypes {
  getUser = 'getUser',
}

export const UseUtilization = (type: LicenseScopes) =>
  SetMetadata('licenseUtilization', type);
