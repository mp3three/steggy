import { IsDateString, IsSemVer } from 'class-validator';

import { GitConfigUser } from '.';

//
// Don't forget to update the `changelog.schema.json` file!
//

export class ChangeItemMessage {
  text?: string;
}

export class RootChange {
  version: string;
  message: ChangeItemMessage;
}

export class ChangelogDTO {
  /**
   * Data is being versioned to facilitate potential upgrades in the future
   */
  version: 1;
  author: GitConfigUser;
  @IsDateString()
  date: string;
  @IsSemVer()
  root: RootChange;
  changes: ChangeItemDTO[];
}

export class ChangeItemDTO {
  @IsSemVer()
  from: string;
  @IsSemVer()
  to: string;
  project: string;
  message: ChangeItemMessage;
}
