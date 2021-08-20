import { PlatformTypes, TemplateTypes } from '../enums';

export class UpdatePayloadDTO {
  // #region Object Properties

  /**
   * Description of the template
   */
  public description: string;
  /**
   * Content of stack file
   */
  public fileContent: string;
  /**
   * URL of the template's logo
   */
  public logo?: string;
  /**
   * A note that will be displayed in the UI. Supports HTML content
   */
  public note?: string;
  /**
   * Platform associated to the template.
   */
  public platform: PlatformTypes;
  /**
   * Title of the template
   */
  public title: string;
  /**
   * Type of created stack
   */
  public type: TemplateTypes;

  // #endregion Object Properties
}
