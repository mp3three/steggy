import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class EmailComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  declare public type: ComponentTypes.email;

  // #endregion Object Properties
}
