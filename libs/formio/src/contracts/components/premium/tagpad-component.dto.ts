import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TagpadComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  public declare input: true;
  public declare type: ComponentTypes.tagpad;

  // #endregion Object Properties
}
