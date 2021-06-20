import { IsString, ValidateNested } from 'class-validator';

import { SubmissionDTO } from '../submission.dto';
import { TeamDTO } from './team.dto';

export class TeamMemberDataDTO {
  // #region Object Properties

  @IsString()
  public admin?: boolean;
  @IsString()
  public email: string;
  @IsString()
  public userId?: string;
  @ValidateNested()
  public team: TeamDTO;

  // #endregion Object Properties
}
export class TeamMemberDTO extends SubmissionDTO {
  // #region Object Properties

  public data: TeamMemberDataDTO;
  public metadata?: { accepted?: boolean };

  // #endregion Object Properties
}
