import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class PanelComponentDTO extends BaseLayoutComponentDTO {
  // #region Object Properties

  public type: ComponentTypes.panel;

  // #endregion Object Properties
}
