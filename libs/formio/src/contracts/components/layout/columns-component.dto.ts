import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class ColumnsComponentDTO extends BaseLayoutComponentDTO {
  // #region Object Properties

  public columns: { components: BaseComponentDTO[] }[];
  public type: ComponentTypes.columns;

  // #endregion Object Properties
}
