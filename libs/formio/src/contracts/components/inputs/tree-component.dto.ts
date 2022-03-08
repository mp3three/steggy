import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TreeComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  declare public input: true;
  public tree: boolean;
  declare public type: ComponentTypes.textarea;

  // #endregion Object Properties
}
