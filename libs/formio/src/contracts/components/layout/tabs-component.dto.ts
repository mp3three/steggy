import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TabComponentTabDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  public key: string;
  public label: string;

  // #endregion Object Properties
}

export class TabComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  /**
   * Array of components inside a row / col grid
   */
  public components?: TabComponentTabDTO;
  public input: false;
  public type: ComponentTypes.tabs;

  // #endregion Object Properties
}
