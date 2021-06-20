import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class DataGridComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public addAnotherPosition?: 'top' | 'bottom';
  public components?: BaseComponentDTO[];
  public defaultValue?: Record<string, unknown>[];
  public enableRowGroups?: boolean;
  public initEmpty?: boolean;
  public input?: true;
  public layoutFixed?: boolean;
  public reorder?: boolean;
  public type: ComponentTypes.datagrid;

  // #endregion Object Properties
}
