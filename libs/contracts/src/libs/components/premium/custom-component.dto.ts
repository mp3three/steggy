import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from '../inputs';

export class CustomComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.custom;

  // #endregion Object Properties
}
