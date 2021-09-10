import { PlatformTypes, TemplateTypes } from '../enums';

export class CustomFromGitRepositoryPayloadDTO {
  /**
   * Path to the Stack file inside the Git repository
   */
  public composeFilePathInRepository?: string;
  /**
   * Description of the template
   */
  public description: string;
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
   * Use basic authentication to clone the Git repository
   */
  public repositoryAuthentication?: boolean;
  /**
   * Password used in basic authentication. Required when RepositoryAuthentication is true.
   */
  public repositoryPassword?: string;
  /**
   * Reference name of a Git repository hosting the Stack file
   *
   * @example refs/heads/develop
   */
  public repositoryReferenceName?: string;
  /**
   * URL of a Git repository hosting the Stack file
   */
  public repositoryURL: string;
  /**
   * Username used in basic authentication. Required when RepositoryAuthentication is true.
   */
  public repositoryUsername?: string;
  /**
   * Title of the template
   */
  public title: string;
  /**
   * Type of created stack
   */
  public type: TemplateTypes;
}
