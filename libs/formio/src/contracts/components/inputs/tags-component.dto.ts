import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TagsComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.tags;

  // #endregion Object Properties
}
