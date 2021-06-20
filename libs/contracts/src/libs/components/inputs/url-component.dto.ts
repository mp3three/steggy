import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class UrlComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.url;

  // #endregion Object Properties
}
