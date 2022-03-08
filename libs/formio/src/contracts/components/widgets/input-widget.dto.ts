import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class InputWidgetDTO extends BaseWidgetDTO {
  // #region Object Properties

  declare public type: WidgetTypes.input;

  // #endregion Object Properties
}
