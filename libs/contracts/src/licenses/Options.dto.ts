import { IsBoolean } from '@automagical/validation';

export class LicenseOptionsDTO {
  // #region Object Properties

  /**
   * @FIXME: Description
   */
  @IsBoolean()
  public evaluation: boolean;
  /**
   * @FIXME: Description
   */
  @IsBoolean()
  public sac: boolean;
  /**
   * @FIXME: Description
   */
  @IsBoolean()
  public vpat: boolean;

  // #endregion Object Properties
}
