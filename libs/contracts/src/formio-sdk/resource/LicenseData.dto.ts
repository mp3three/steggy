import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from '@automagical/validation';
import { LicenseKeyDTO, LicenseLocations, UserDTO } from '../..';
import { LicenseAdminDTO, LicenseTermsDTO } from './LicenseAdmin.dto';

export class LicenseDataDTO extends LicenseTermsDTO {
  // #region Object Properties

  /**
   * Security and Compliance
   */
  @IsBoolean()
  public sac: boolean;
  /**
   * @FIXME: Populate description
   */
  @IsBoolean()
  public vpat: boolean;
  /**
   * Overview > Location
   */
  @IsEnum(LicenseLocations)
  public location: LicenseLocations;
  /**
   * License Terms > Usage Limits > Database Tenants
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public dbts: number;
  /**
   * Overview > Description / Comments
   */
  @IsString()
  public comments: string;
  /**
   * Overview > Company
   */
  @IsString()
  public company: string;
  /**
   * Overview > License Name
   */
  @IsString()
  public licenseName: string;
  /**
   * License Keys
   */
  @ValidateNested({ each: true })
  public licenseKeys: LicenseKeyDTO[];
  /**
   * Overview > License Users
   */
  @ValidateNested({
    each: true,
  })
  public user: UserDTO[];

  // #endregion Object Properties
}
