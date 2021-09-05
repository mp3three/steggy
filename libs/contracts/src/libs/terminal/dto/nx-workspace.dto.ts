export type NXProjectTypes = 'library' | 'application';
export class NXProjectDTO {
  // #region Object Properties

  public projectType: NXProjectTypes;
  public root: string;
  public sourceRoot: string;
  public targets: Record<string, unknown>;

  // #endregion Object Properties
}
export class NXWorkspaceDTO {
  // #region Object Properties

  public projects: Record<string, NXProjectDTO>;

  // #endregion Object Properties
}
export const NX_WORKSPACE_FILE = 'workspace.json';
