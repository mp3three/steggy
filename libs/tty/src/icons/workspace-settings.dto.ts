export class WorkspaceSettingsDTO {
  public customHeader?: boolean;
  public friendlyName: string;
  public menu?: string[];
  public name: string;
  public roomRemote?: boolean;
}
export const WORKSPACE_SETTINGS = Symbol('WORKSPACE_SETTINGS');

export class WorkspaceElementSettingsDTO {}
export const WORKSPACE_ELEMENT = Symbol('WORKSPACE_ELEMENT');
