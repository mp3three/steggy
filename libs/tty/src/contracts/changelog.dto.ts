import { IsDateString, IsSemVer } from 'class-validator';

export class ChangelogDTO {
  /**
   * Changelog schema version. Increment for modifications
   */
  version: 1;
  author: string;
  @IsDateString()
  date: string;
  @IsSemVer()
  root: string;
  changes: ChangeItemDTO[];
}
export class ChangeItemDTO {
  @IsSemVer()
  from: string;
  @IsSemVer()
  to: string;
  project: string;
  message: string;
}
