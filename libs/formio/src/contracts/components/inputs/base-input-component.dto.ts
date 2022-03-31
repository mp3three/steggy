import { BaseComponentDTO } from '../base-component.dto';
import { DataType } from '../enums';
import { ConditionalDTO, OverlayDTO, ValidateDTO } from '../include';

export class BaseInputComponentDTO extends BaseComponentDTO {
  /**
   * When checked, this will allow the user to manually override the calculated value.
   */
  public allowCalculateOverride?: boolean;
  public allowMultipleMasks?: boolean;
  /**
   * Make this field the initially focused element on this form.
   */
  public autofocus?: boolean;
  /**
   * Checking this will run the calculation on the server. This is useful if you wish to override the values submitted with the calculations performed on the server.
   */
  public calculateServer?: boolean;
  public calculateValue?: string;
  /**
   * When a field is hidden, clear the value.
   */
  public clearOnHide?: boolean;
  public conditional?: ConditionalDTO;
  /**
   * Custom CSS class to add to this component.
   */
  public customClass?: string;
  /**
   * ## Example
   *
   * ```value = data.firstName + " " + data.lastName;```
   */
  public customDefaultValue?: string | Record<string, unknown>[];
  public dataGridLabel?: string | false;
  public dataType?: DataType;
  /**
   * Set this field as an index within the database. Increases performance for submission queries.
   */
  public dbIndex?: boolean;
  public defaultValue?: unknown;
  /**
   * Disable the form input.
   */
  public disabled?: boolean;
  /**
   * Encrypt this field on the server. This is two way encryption which is not suitable for passwords.
   */
  public encrypted?: boolean;
  /**
   * The label for this field when an error occurs.
   */
  public errorLabel?: string;
  /**
   * A hidden field is still a part of the form, but is hidden from view.
   */
  /**
   * Hide the input in the browser. This does not encrypt on the server. Do not use for passwords.
   */
  public hidden?: boolean;
  public declare input: true;
  public leftIcon?: string;
  /**
   * Opens up a modal to edit the value of this component.
   */
  public modalEdit?: boolean;
  /**
   * Allows multiple values to be entered for this field.
   */
  public multiple?: boolean;
  public overlay?: OverlayDTO;
  /**
   * A persistent field will be stored in database when the form is submitted.
   */
  public persistent?: boolean | 'client-only';
  /**
   * The placeholder text that will appear when this field is empty.
   *
   * Not all components support
   */
  public placeholder?: string;
  /**
   * UI prop
   */
  public prefix?: string;
  /**
   * Redraw this component if another component changes. This is useful if interpolating parts of the component like the label.
   */
  public redrawOn?: 'data' | 'submit' | string;
  public refreshOn?: string;
  /**
   * A required field must be filled in before the form can be submitted.
   */
  public required?: boolean;
  public rightIcon?: string;
  /**
   * Show a live count of the number of characters.
   */
  public showCharCount?: boolean;
  /**
   * Show a live count of the number of words.
   */
  public showWordCount?: boolean;
  public size?: 'md';
  public storeas?: 'string' | 'array';
  /**
   * UI prop
   */
  public suffix?: string;
  /**
   * Sets the tabindex attribute of this component to override the tab order of the form.
   *
   * See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)
   */
  public tabIndex?: string;
  /**
   * Shows this value within the table view of the submissions.
   */
  public tableView?: boolean;
  public theme?: string;
  /**
   * Adds a tooltip to the side of this field.
   */
  public tooltip?: string;
  /**
   * Makes sure the data submitted for this field is unique, and has not been submitted before.
   */
  public unique?: boolean;
  public validate?: ValidateDTO;
  /**
   * Determines when this component should trigger front-end validation.
   */
  public validateOn?: 'blur' | 'change';

  
}
