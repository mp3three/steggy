export class ValidateDTO {
  // #region Object Properties

  /**
   * ## Description
   *
   * You must assign the valid variable as either true or an error message if validation fails.
   *
   * ## Example
   *
   * ```valid = (input === 'Joe') ? true : 'Your name must be "Joe"';```
   */
  public custom?: string | Record<string, unknown>;
  /**
   * The label for this field when an error occurs.
   */
  public customMessage?: string;
  /**
   * Check this if you wish to perform the validation ONLY on the server side. This keeps your validation logic private and secret.
   */
  public customPrivate?: boolean;
  /**
   * https://jsonlogic.com/
   */
  public json?: Record<string, unknown>;
  /**
   * The maximum length requirement this field must meet.
   */
  public maxLength?: number;
  /**
   * The maximum amount of words that can be added to this field.
   */
  public maxWords?: number;
  /**
   * The minimum length requirement this field must meet.
   */
  public minLength?: number;
  /**
   * The minimum amount of words that can be added to this field.
   */
  public minWords?: number;
  public onlyAvailableOptions?: boolean;
  public pattern?: string;
  public required?: boolean;

  // #endregion Object Properties
}
