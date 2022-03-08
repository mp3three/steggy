import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { AttrsDTO as AttributesDTO } from '../include';

export class ContentComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public attrs?: AttributesDTO;
  public content?: string;
  public refreshOnChange?: boolean;
  declare public type: ComponentTypes.content;

  // #endregion Object Properties
}
