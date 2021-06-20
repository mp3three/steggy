import { SubmissionDTO } from '../submission.dto';

export class TeamDTO extends SubmissionDTO {
  // #region Object Properties

  public data: { name: string };
  public metadata: { memberCount: number };

  // #endregion Object Properties
}
