import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { AttrsDTO as AttributesDTO } from '../include';

export class HtmlElementComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public attrs?: AttributesDTO;
  public content?: string;
  public refreshOnChange?: boolean;
  public type: ComponentTypes.htmlelement;

  // #endregion Object Properties
}
