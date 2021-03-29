import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from '@automagical/validation';
import { UserDTO } from '../formio-sdk';
import { LicenseKeyDTO } from './Key.dto';
import { LicenseOptionsDTO } from './Options.dto';
import { LicensePlans } from './types';

export class UtilizationResponseTermsDTO {
  // #region Object Properties

  @IsDateString()
  @IsOptional()
  public developmentLicense?: boolean;
  @IsDateString()
  @IsOptional()
  public startDate?: string;
  @IsEnum(LicensePlans)
  public plan: LicensePlans;
  @IsNumber()
  public apiServers: number;
  @IsNumber()
  public emails: number;
  @IsNumber()
  public formManagers: number;
  @IsNumber()
  public formRequests: number;
  @IsNumber()
  public forms: number;
  @IsNumber()
  public livestages: number;
  @IsNumber()
  public pdfDownloads: number;
  @IsNumber()
  public pdfServers: number;
  @IsNumber()
  public pdfs: number;
  @IsNumber()
  public projects: number;
  @IsNumber()
  public submissionRequests: number;
  @IsNumber()
  public tenants: number;
  @IsNumber()
  public vpats: number;
  @IsOptional()
  @IsDateString()
  public endDate?: string;
  @IsOptional()
  @ValidateNested()
  public user?: UserDTO[];
  @ValidateNested()
  public options: LicenseOptionsDTO;
  @ValidateNested()
  @IsOptional()
  public licenseKeys: LicenseKeyDTO[];

  // #endregion Object Properties
}
