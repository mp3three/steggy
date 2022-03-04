import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class InputWidgetDTO extends BaseWidgetDTO {
  // #region Object Properties

  public type: WidgetTypes.input;

  // #endregion Object Properties
}
