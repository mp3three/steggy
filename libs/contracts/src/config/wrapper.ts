import type JiraApi from 'jira-client';

export class WrapperConfig {
  // #region Object Properties

  /**
   * For providing credentials to jira service
   */
  public jira: JiraApi.JiraApiOptions;

  // #endregion Object Properties
}

export const JIRA_CONFIG = 'libs.wrapper.jira';
