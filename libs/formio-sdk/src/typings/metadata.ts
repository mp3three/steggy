import { LicenseScopes } from '@automagical/contracts/licenses';
import { SetMetadata } from '@nestjs/common';

export enum MetadataTypes {
  getUser = 'getUser',
}

export const UseUtilization = (type: LicenseScopes): unknown =>
  SetMetadata('licenseUtilization', type);
