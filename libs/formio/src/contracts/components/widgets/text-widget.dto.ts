import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class TextWidgetDTO extends BaseWidgetDTO {
  // #region Object Properties

  declare public type: WidgetTypes.text;

  // #endregion Object Properties
}
