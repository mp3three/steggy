import { SetMetadata } from '@nestjs/common';
import { LicenseScopes } from '@automagical/contracts/licenses';

export enum MetadataTypes {
  getUser = 'getUser',
}

export const UseUtilization = (type: LicenseScopes): unknown =>
  SetMetadata('licenseUtilization', type);
