import { IsDateString, IsSemVer } from 'class-validator';

import { GitConfigUser } from './git.dto';

//
// Don't forget to update the `changelog.schema.json` file!
//

export class ChangeItemMessage {
  text?: string;
}

export class RootChange {
  message: ChangeItemMessage;
  version: string;
}

export class ChangelogDTO {
  @IsDateString()
  date: string;
  @IsSemVer()
  root: RootChange;
  author: GitConfigUser;
  changes: ChangeItemDTO[];
  /**
   * Data is being versioned to facilitate potential upgrades in the future
   */
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  version: 1;
}

export class ChangeItemDTO {
  @IsSemVer()
  from: string;
  @IsSemVer()
  to: string;
  message: ChangeItemMessage;
  project: string;
}
