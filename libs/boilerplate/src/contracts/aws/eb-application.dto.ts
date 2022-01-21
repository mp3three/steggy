class Rule {
  public DeletedSourceFromS3: boolean;
  public Enabled: boolean;
  public MaxCount: number;
}

export class EBApplicationDTO {
  public ApplicationArn: string;
  public ApplicationName: string;
  public DateCreated: Date;
  public DateUpdated: Date;
  public ResourceLifecycleConfig: Record<'MaxCountRule' | 'MaxAgeRule', Rule>;
  public Versions: string[];
}
