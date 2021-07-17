export class EBEnvironmentDTO {
  // #region Object Properties

  public AbortableOperationInProgress: boolean;
  public ApplicationName: string;
  public CNAME: string;
  public DateCreated: Date;
  public DateUpdated: Date;
  public EndpointURL: string;
  public EnvironmentArn: string;
  public EnvironmentId: string;
  public EnvironmentLinks: unknown[];
  public EnvironmentName: string;
  public Health: string;
  public PlatformArn: string;
  public SolutionStackName: string;
  public Status: string;
  public Tier: Record<'Name' | 'Type' | 'Version', string>;
  public VersionLabel: 'living-docs:latest';

  // #endregion Object Properties
}
