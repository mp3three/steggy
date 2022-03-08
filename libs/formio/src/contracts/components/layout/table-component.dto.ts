import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TableComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public cellAlignment?: 'left' | 'right' | 'center';
  public declare input: false;
  /**
   * Array of components inside a row / col grid
   */
  public rows?: { components: BaseComponentDTO[] }[][];
  public declare type: ComponentTypes.table;

  // #endregion Object Properties
}
