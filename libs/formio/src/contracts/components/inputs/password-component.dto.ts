import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class PasswordComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public protected: true;
  public type: ComponentTypes.password;

  // #endregion Object Properties
}
