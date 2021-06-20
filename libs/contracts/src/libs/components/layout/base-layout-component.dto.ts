import { BaseComponentDTO } from '../base-component.dto';

export class BaseLayoutComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public components?: BaseComponentDTO[];
  public input: false;

  // #endregion Object Properties
}
