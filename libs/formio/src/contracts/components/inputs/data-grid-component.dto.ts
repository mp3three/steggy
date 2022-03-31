import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class DataGridComponentDTO extends BaseComponentDTO {
  public addAnotherPosition?: 'top' | 'bottom';
  public components?: BaseComponentDTO[];
  public defaultValue?: Record<string, unknown>[];
  public enableRowGroups?: boolean;
  public initEmpty?: boolean;
  public declare input?: true;
  public layoutFixed?: boolean;
  public reorder?: boolean;
  public declare type: ComponentTypes.datagrid;

  
}
