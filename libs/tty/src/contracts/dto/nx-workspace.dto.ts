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
  outputPath?: string;
  fileReplacements?: Record<'replace' | 'with', string>[];
  main?: string;
  generatePackageJson?: boolean;
  optimization?: boolean;
  extractLicenses?: boolean;
  inspect?: boolean;
  tsConfig?: string;
}
export class NXWorkspaceDTO {
  public projects: Record<string, NXProjectDTO>;
}
export const NX_WORKSPACE_FILE = 'workspace.json';
export const NX_METADATA_FILE = 'nx.json';
export const SCAN_CONFIG_CONFIGURATION = 'scan-config';

export class NXMetadata {
  implicitDependencies: Record<string, unknown>;
  affected: {
    defaultBase: string;
  };
  npmScope: string;
  taskRunnerOptions: Record<
    'default',
    {
      runner: string;
      options: {
        cachableOperations: string[];
        accessToken: string;
        canTrackAnalytics: boolean;
        showUsageWarnings: boolean;
      };
    }
  >;
  workspaceLayout: Record<'appsDir' | 'libsDir', string>;
  projects: Record<string, unknown>;
  targetDependencies: Record<'build', Record<'target' | 'projects', string>[]>;
}
