import { BaseInputComponentDTO } from './base-input-component.dto';

export class ButtonComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public action?: string;
  public block?: boolean;
  public disableOnInvalid?: boolean;

  // #endregion Object Properties
}
