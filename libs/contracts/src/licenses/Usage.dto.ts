import { IsNumber } from '@automagical/validation';

export class LicenseBaseDTO {
  // #region Object Properties

  /**
   * License Terms > On-Premise Servers > API Environment
   */
  @IsNumber()
  public apiServers: number;
  /**
   * License Terms > Usage Limits > Form Manager Projects
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public formManagers: number;
  /**
   * License Terms > On-Premise Servers > PDF Environment
   */
  @IsNumber()
  public pdfServers: number;
  /**
   * License Terms > Usage Limits > Projects
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public projects: number;
  /**
   * License Terms > Usage Limits > Form Building Tenants
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public tenants: number;

  // #endregion Object Properties
  /**
   * License Terms > Usage Limits > Projects
   *
   * Per License, Tracked as Total
   */
}

export class LicenseUsageDTO extends LicenseBaseDTO {
  // #region Object Properties

  /**
   * License Terms > Usage Limits > Projects
   *
   * Per License, Tracked as Total
   */
  @IsNumber()
  public vpat: number;

  // #endregion Object Properties
}
