import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class ResourceFieldsComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  declare public type: ComponentTypes.resourcefields;

  // #endregion Object Properties
}
