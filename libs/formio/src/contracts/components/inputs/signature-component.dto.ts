import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SignatureComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.signature;

  // #endregion Object Properties
}
