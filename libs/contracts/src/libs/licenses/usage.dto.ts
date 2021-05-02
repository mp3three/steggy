import { IsNumber } from '@automagical/validation';

import { LicenseBaseDTO } from './license-base.dto';

/**
 * Built this way for documentation reasons
 */
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
