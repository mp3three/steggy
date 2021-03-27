import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from '@automagical/validation';
import { LicenseOptionsDTO } from './license/Options.dto';
import { LicenseBaseDTO, LicenseUsageDTO } from './license/Usage.dto';
import { LicensePlans, LicenseScopes, LicenseUsage } from './LicenseData.dto';

export class LicenseTermsDTO extends LicenseBaseDTO {
  // #region Object Properties

  /**
   * License Terms > Plan > Start Date
   */
  @IsDateString()
  public startDate: string;
  /**
   * License Terms > Plan > End Date
   */
  @IsDateString()
  @IsOptional()
  public endDate?: string;
  @IsEnum(LicensePlans)
  public plan: LicensePlans;
  /**
   * License Terms > Usage Limits > Emails
   *
   * Per Project, Tracked Monthly (hosted only)
   */
  @IsNumber()
  public emails?: number;
  /**
   * License Terms > Usage Limits > Form Loads
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public formRequests: number;
  /**
   * License Terms > Usage Limits > Forms
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public forms: number;
  /**
   * License Terms > Usage Limits > Additional Live Stages
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public livestages: number;
  /**
   * License Terms > Usage Limits > PDF Generations
   *
   * Per Project, Tracked Monthly (hosted only)
   */
  @IsNumber()
  public pdfDownload: number;
  /**
   * License Terms > Usage Limits > Hosted PDF Documents
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public pdfs: number;
  /**
   * License Terms > Usage Limits > Stages (in addition to live)
   *
   * Per License, Tracked as Total
   *
   * > CORS Locked authoring mode stages, these will be unsuitable for production
   */
  @IsNumber()
  public stages: number;
  /**
   * License Terms > Usage Limits > Submission Requests
   *
   * Per Project, Tracked as Total (hosted only)
   */
  @IsNumber()
  public submissionRequests: number;
  /**
   * License Terms > Options
   */
  @ValidateNested()
  public options: LicenseOptionsDTO;

  // #endregion Object Properties
}

export class LicenseAdminDTO {
  // #region Object Properties

  public scopes: LicenseScopes[];
  public terms: LicenseTermsDTO;
  public usage: LicenseUsage;

  // #endregion Object Properties
}
