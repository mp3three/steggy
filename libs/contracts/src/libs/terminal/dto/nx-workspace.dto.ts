export type NXProjectTypes = 'library' | 'application';
export class NXProjectDTO {
  public projectType: NXProjectTypes;
  public root: string;
  public sourceRoot: string;
  public targets: Record<string, unknown>;
}
export class NXWorkspaceDTO {
  public projects: Record<string, NXProjectDTO>;
}
export const NX_WORKSPACE_FILE = 'workspace.json';
