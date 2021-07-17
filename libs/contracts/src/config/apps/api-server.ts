export class APIServerApplicationSettingsDTO {
  // #region Object Properties

  public configuration?: 'api-server' | 'submission-server' | 'testing';
  public formiojs?: string;
  public version?: string;

  // #endregion Object Properties
}

export const FORMIOJS_VERSION = 'application.formiojs';
export const ITERATION_VERSION = 'application.version';
