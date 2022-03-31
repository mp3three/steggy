import { WidgetTypes } from '../enums';
import { BaseWidgetDTO } from './base-widget.dto';

export class InputWidgetDTO extends BaseWidgetDTO {
  public declare type: WidgetTypes.input;

  
}
