export type NXProjectTypes = 'library' | 'application';
export class NXProjectDTO {
  public projectType: NXProjectTypes;
  public root: string;
  public sourceRoot: string;
  public targets: Record<string, NXProjectTarget>;
}
export class NXProjectTarget {
  executor: string;
  options?: NXApplicationOptions;
  configurations?: Record<string, NXApplicationOptions>;
}
export class NXApplicationOptions {
  //
}
export class NXWorkspaceDTO {
  public projects: Record<string, NXProjectDTO>;
}
export const NX_WORKSPACE_FILE = 'workspace.json';
