import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class TextWidgetDTO extends BaseWidgetDTO {
  // #region Object Properties

  public type: WidgetTypes.text;

  // #endregion Object Properties
}
