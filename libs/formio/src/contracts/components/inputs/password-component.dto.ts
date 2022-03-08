import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class PasswordComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public declare protected: true;
  public declare type: ComponentTypes.password;

  // #endregion Object Properties
}
