import { IsNumber } from '@automagical/validation';

export class LicenseMonthlyUsageDTO {
  // #region Object Properties

  @IsNumber()
  public emails: number;
  @IsNumber()
  public formRequests: number;
  @IsNumber()
  public forms: number;
  @IsNumber()
  public pdfDownloads: number;
  @IsNumber()
  public pdfs: number;
  @IsNumber()
  public submissionRequests: number;

  // #endregion Object Properties
}
