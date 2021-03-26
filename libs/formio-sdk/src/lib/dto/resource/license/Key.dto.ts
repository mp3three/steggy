import { IsEnum, IsString } from '@automagical/validation';
import { LicenseScopes } from '..';

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
