import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class ReCaptchaComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public input: true;
  public type: ComponentTypes.recaptcha;

  // #endregion Object Properties
}
