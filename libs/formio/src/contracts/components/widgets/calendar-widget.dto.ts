import { CalendarWidgetMode, WidgetTypes } from '../enums';
import { Locale } from '../enums/locale';
import { BaseWidgetDTO } from './base-widget.dto';

export class CalendarWidgetDTO extends BaseWidgetDTO {
  // #region Object Properties

  public allowInput?: boolean;
  public altInput?: boolean;
  public clickOpens?: boolean;
  public dateFormat?: string;
  public enableDate?: boolean;
  public enableTime?: boolean;
  public format?: string;
  public hourIncrement?: number;
  public locale?: Locale;
  public maxDate?: string;
  public minDate?: string;
  public minuteIncrement?: number;
  public mode?: CalendarWidgetMode;
  public noCalendar?: boolean;
  public saveAs?: 'date';
  public time_24hr?: boolean;
  declare public type: WidgetTypes.calendar;
  public useLocaleSettings?: boolean;

  // #endregion Object Properties
}
