import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class CheckboxComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.checkbox;

  // #endregion Object Properties
}
