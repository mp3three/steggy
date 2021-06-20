import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TreeComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  public input: true;
  public tree: boolean;
  public type: ComponentTypes.textarea;

  // #endregion Object Properties
}
