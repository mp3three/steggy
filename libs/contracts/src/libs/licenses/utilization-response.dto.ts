import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { LicenseKeyDTO } from './Key.dto';
import { LicenseMonthlyUsageDTO } from './monthly-usage.dto';
import { UtilizationResponseTermsDTO } from './terms.dto';
import { LicenseScopes } from './types';

// Not sure if this is useful right now, but I don't feel like re-writing later
// import { createHash } from 'crypto';
// public static VerifyHash(
//   response: UtilizationResponseDTO,
//   body: Record<string, unknown>,
// ) {
//   const base64 = Buffer.from(JSON.stringify(body)).toString('base64');
//   const md5 = createHash('md5').update(base64).digest('hex');
//   return md5 === response.hash;
// }

export class UtilizationResponseDTO {
  // #region Object Properties

  @IsBoolean()
  public devLicense: boolean;
  @IsEnum(LicenseScopes)
  public type: LicenseScopes;
  @IsString()
  public licenseId: string;
  @IsString()
  public licenseKey: string;
  @IsString()
  public projectId: string;
  @IsString()
  @IsOptional()
  hash?: string;
  @ValidateNested()
  public keys: Record<string, LicenseKeyDTO>;
  @ValidateNested()
  public terms: UtilizationResponseTermsDTO;
  @ValidateNested()
  public used: LicenseMonthlyUsageDTO;

  // #endregion Object Properties
}
