class Rule {
  // #region Object Properties

  public DeletedSourceFromS3: boolean;
  public Enabled: boolean;
  public MaxCount: number;

  // #endregion Object Properties
}

export class EBApplicationDTO {
  // #region Object Properties

  public ApplicationArn: string;
  public ApplicationName: string;
  public DateCreated: Date;
  public DateUpdated: Date;
  public ResourceLifecycleConfig: Record<'MaxCountRule' | 'MaxAgeRule', Rule>;
  public Versions: string[];

  // #endregion Object Properties
}
