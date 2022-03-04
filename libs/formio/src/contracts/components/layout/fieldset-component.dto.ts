import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class FieldSetComponentDTO extends BaseLayoutComponentDTO {
  // #region Object Properties

  public legend?: string;
  public tree?: boolean;
  public type: ComponentTypes.fieldset;

  // #endregion Object Properties
}
