import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class ReCaptchaComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public declare input: true;
  public declare type: ComponentTypes.recaptcha;

  // #endregion Object Properties
}
