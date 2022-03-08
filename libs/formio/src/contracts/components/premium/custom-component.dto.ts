import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from '../inputs';

export class CustomComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public declare type: ComponentTypes.custom;

  // #endregion Object Properties
}
