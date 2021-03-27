import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from '@automagical/validation';
import { LicenseOptionsDTO } from './Options.dto';
import { LicensePlans } from './types';

export class UtilizationResponseTermsDTO {
  // #region Object Properties

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
  public endregion: number;
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
  @ValidateNested()
  public options: LicenseOptionsDTO;

  // #endregion Object Properties
}
