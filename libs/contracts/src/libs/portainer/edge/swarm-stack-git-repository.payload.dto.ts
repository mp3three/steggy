export class SwarmStackGitRepositoryPayloadDTO {
  /**
   * Path to the Stack file inside the Git repository
   */
  public composeFilePathInRepository?: string;
  /**
   * List of identifiers of EdgeGroups
   */
  public edgeGroups: number[];
  /**
   * Name of the stack
   */
  public name: string;
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
}
