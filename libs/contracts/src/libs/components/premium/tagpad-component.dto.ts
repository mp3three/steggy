import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TagpadComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  public input: true;
  public type: ComponentTypes.tagpad;

  // #endregion Object Properties
}
