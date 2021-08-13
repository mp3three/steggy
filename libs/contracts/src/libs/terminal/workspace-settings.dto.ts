export class WorkspaceSettingsDTO {
  // #region Object Properties

  public customHeader?: boolean;
  public friendlyName: string;
  public menu?: string[];
  public name: string;

  // #endregion Object Properties
}
export const WORKSPACE_SETTINGS = Symbol('WORKSPACE_SETTINGS');

export class WorkspaceElementSettingsDTO {}
export const WORKSPACE_ELEMENT = Symbol('WORKSPACE_ELEMENT');
