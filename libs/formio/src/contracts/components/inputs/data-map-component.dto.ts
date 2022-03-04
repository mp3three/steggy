import { BaseComponentDTO } from '../base-component.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class DataMapComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public input?: true;
  public valueComponent: BaseInputComponentDTO;

  // #endregion Object Properties
}
