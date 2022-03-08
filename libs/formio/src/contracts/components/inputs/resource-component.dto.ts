import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class ResourceComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public template: string;
  declare public type: ComponentTypes.resource;

  // #endregion Object Properties
}
