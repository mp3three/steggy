import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class ContainerComponentDTO extends BaseLayoutComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.container;

  // #endregion Object Properties
}
