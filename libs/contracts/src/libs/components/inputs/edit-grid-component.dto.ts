import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class EditGridComponent extends BaseComponentDTO {
  // #region Object Properties

  public components: BaseComponentDTO[];
  public input: true;
  public rowDrafts: boolean;
  public type: ComponentTypes.editgrid;

  // #endregion Object Properties
}
