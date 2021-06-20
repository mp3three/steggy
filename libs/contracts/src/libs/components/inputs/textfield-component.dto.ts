import { ComponentTypes } from '../enums';
import { Autocomplete } from '../enums/autocomplete';
import { CalendarWidgetDTO, InputWidgetDTO } from '../widgets';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TextFieldComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  /**
   * Indicates whether input elements can by default have their values automatically completed by the browser.
   *
   * See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
   */
  public autocomplete?: Autocomplete;
  /**
   * When data is entered, you can change the case of the value.
   */
  public case?: 'mixed' | 'uppercase' | 'lowercase';
  public custom?: string;
  /**
   * Custom error message
   */
  public customMessage?: string;
  public customPrivate?: boolean;
  public description?: string;
  public id?: string;
  /**
   * Force the output of this field to be sanitized in a specific format.
   */
  public inputFormat?: 'plain' | 'html' | 'raw';
  /**
   * An input mask helps the user with input by ensuring a predefined format.
   *
   * 9: numeric
   *
   * a: alphabetical
   *
   * *: alphanumeric
   *
   * Example telephone mask: (999) 999-9999
   *
   * See the [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask) documentation for more information.
   */
  public inputMask?: string;
  /**
   * You can specify a char which will be used as a placeholder in the field.
   *
   * E.g., ˍ
   *
   * Make note that placeholder char will be replaced by a space if it is used inside the mask
   */
  public inputMaskPlaceholderChar?: string;
  public inputMasks?: Record<'label' | 'mask', string>[];
  public inputType?: 'text' | 'password';
  /**
   * Hide the input in the browser. This does not encrypt on the server. Do not use for passwords.
   */
  public mask?: boolean;
  /**
   * The maximum length requirement this field must meet.
   */
  public maxLength?: number;
  /**
   * The minimum length requirement this field must meet.
   */
  public minLength?: number;
  public pattern?: string;
  public spellcheck?: boolean;
  public stringDateValidation?: boolean;
  public type: ComponentTypes.textfield;
  /**
   * The widget is the display UI used to input the value of the field.
   */
  public widget?: InputWidgetDTO | CalendarWidgetDTO;

  // #endregion Object Properties
}
