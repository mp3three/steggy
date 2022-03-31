import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class TextWidgetDTO extends BaseWidgetDTO {
  public declare type: WidgetTypes.text;

  
}
