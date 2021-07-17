import { SubmissionDTO } from '../../formio-sdk/';

export enum CHANGELOG_TAGS {
  fix = 'fix',
  feature = 'feature',
}
export enum CHANGELOG_TICKETSOURCE {
  jira = 'jira',
  trello = 'trello',
  github = 'github',
  none = 'none',
}

export class ChangelogTicketDTO {
  // #region Object Properties

  public description?: string;
  public source: CHANGELOG_TICKETSOURCE;
  public ticketNumber?: string;

  // #endregion Object Properties
}

export class ChangelogDataDTO {
  // #region Object Properties

  /**
   * affected package.json in app folder
   */
  public appVersions: Record<'name' | 'version', string>[];
  /**
   * Longer form explanation of changes
   *
   * Or branch commit messages
   */
  public comments: string;
  /**
   * affected package.json from libs
   */
  public libraryUpdates: Record<'name' | 'version', string>[];
  /**
   * Node modules that were modified
   */
  public nodeModules: string[];
  /**
   * package.json in repo root
   */
  public rootVersion: string;
  /**
   * short descriptive tags for describing change
   */
  public tags: CHANGELOG_TAGS[];
  /**
   * Work source
   */
  public ticket: ChangelogTicketDTO;

  // #endregion Object Properties
}

export class ChangelogDTO extends SubmissionDTO<ChangelogDataDTO> {
  // #region Object Properties

  public data: ChangelogDataDTO;

  // #endregion Object Properties
}
