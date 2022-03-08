import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class HiddenComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  declare public type: ComponentTypes.hidden;

  // #endregion Object Properties
}
