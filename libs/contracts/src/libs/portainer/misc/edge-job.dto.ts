import { EdgeJobEndpointMetaDTO } from './job-endpoint-meta.dto';

export class EdgeJobDTO {
  // #region Object Properties

  public Created: number;
  public CronExpression: string;
  public Endpoints: Record<string, EdgeJobEndpointMetaDTO>;
  public Id: number;
  public Name: string;
  public Recurring: boolean;
  public ScriptPath: string;
  public Version: number;

  // #endregion Object Properties
}
