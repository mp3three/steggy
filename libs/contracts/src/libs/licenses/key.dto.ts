import { IsEnum, IsString } from 'class-validator';

import { LicenseScopes } from './scopes';

export class LicenseKeyDTO {
  // #region Object Properties

  @IsEnum(LicenseScopes, {
    each: true,
  })
  public scope: LicenseScopes[];
  @IsString()
  public key: string;
  @IsString()
  public name: string;

  // #endregion Object Properties
}
