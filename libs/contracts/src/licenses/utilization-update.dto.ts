import { IsBoolean, IsEnum, IsString } from '@automagical/validation';
import { PROJECT_TYPES } from '../formio-sdk/Project.dto';

export class UtilizationUpdateDTO {
  // #region Object Properties

  @IsBoolean()
  public remote: null;
  /**
   * TODO I'm pretty sure this definition isn't right, because then it'd be redundant
   */
  @IsEnum(PROJECT_TYPES)
  public projectType: PROJECT_TYPES;
  /**
   * project/stage
   */
  @IsEnum(PROJECT_TYPES)
  public type: PROJECT_TYPES;
  /**
   * License key associated with API server
   */
  @IsString()
  public licenseKey: null;
  /**
   * project/stage name
   */
  @IsString()
  public name: null;
  /**
   * (or stage id)
   */
  @IsString()
  public projectId: null;
  /**
   * project/stage title
   */
  @IsString()
  public title: null;

  // #endregion Object Properties
}
