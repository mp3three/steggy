import { ComponentTypes } from '../enums';
import { ButtonSettingsDTO } from '../include/button-settings.dto';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class PageComponent extends BaseLayoutComponentDTO {
  // #region Object Properties

  public breadcrumbClickable?: boolean;
  public buttonSettings?: ButtonSettingsDTO;
  public collapsible?: boolean;
  public type: ComponentTypes.panel;

  // #endregion Object Properties
}
