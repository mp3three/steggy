import {
  LicenseBaseDTO,
  LicenseOptionsDTO,
  LicensePlans,
  LicenseScopes,
  LicenseUsageDTO,
} from '@automagical/contracts/licenses';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from '@automagical/validation';

export class LicenseTermsDTO extends LicenseBaseDTO {
  // #region Object Properties

  @IsBoolean()
  @IsOptional()
  public developmentLicense?: boolean;
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
   * Per Project, Tracked Monthly (Hosted)
   */
  @IsNumber()
  public emails?: number;
  /**
   * License Terms > Usage Limits > Form Loads
   *
   * Per Project, Tracked as Total (Hosted)
   */
  @IsNumber()
  public formRequests: number;
  /**
   * License Terms > Usage Limits > Forms
   *
   * Per Project, Tracked as Total (Hosted)
   */
  @IsNumber()
  public forms: number;
  /**
   * License Terms > Usage Limits > PDF Generations
   *
   * Per Project, Tracked Monthly (Hosted)
   */
  @IsNumber()
  public pdfDownload: number;
  /**
   * License Terms > Usage Limits > Hosted PDF Documents
   *
   * Per Project, Tracked as Total (Hosted)
   */
  @IsNumber()
  public pdfs: number;
  /**
   * License Terms > Usage Limits > Stages (not live)
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
   * Per Project, Tracked as Total (Hosted)
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
  public usage: LicenseUsageDTO;

  // #endregion Object Properties
}
