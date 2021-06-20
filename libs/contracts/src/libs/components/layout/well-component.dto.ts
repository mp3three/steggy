import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class WellComponentDTO extends BaseLayoutComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.well;

  // #endregion Object Properties
}
