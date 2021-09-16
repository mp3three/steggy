import { PlatformTypes, TemplateTypes } from '../enums';
import { ResourceControlDTO } from './resource-control.dto';

// }
export class CustomTemplateDTO {
  /**
   * User identifier who created this template
   */
  public CreatedByUserId?: number;
  /**
   * Description of the template
   */
  public Description: string;
  /**
   * Path to the Stack file
   */
  public EntryPoint: string;
  /**
   * CustomTemplate Identifier
   */
  public Id: number;
  /**
   * URL of the template's logo
   */
  public Logo: string;
  /**
   * A note that will be displayed in the UI. Supports HTML content
   */
  public Note: string;
  /**
   * Platform associated to the template.
   */
  public Platform: PlatformTypes;
  /**
   * Path on disk to the repository hosting the Stack file
   */
  public ProjectPath: string;
  public ResourceControl: ResourceControlDTO;
  /**
   * Title of the template
   */
  public Title: string;
  /**
   * Type of created stack
   */
  public Type: TemplateTypes;
}
