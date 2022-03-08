import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TextAreaComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  declare public type: ComponentTypes.textarea;

  // #endregion Object Properties
}
