export type NXProjectTypes = 'library' | 'application';
export class NXProjectDTO {
  public projectType: NXProjectTypes;
  public root: string;
  public sourceRoot: string;
  public targets: Record<string, NXProjectTarget>;
}
export class NXProjectTarget {
  configurations?: Record<string, NXApplicationOptions>;
  executor: string;
  options?: NXApplicationOptions;
}
export class NXApplicationOptions {
  extractLicenses?: boolean;
  fileReplacements?: Record<'replace' | 'with', string>[];
  generatePackageJson?: boolean;
  inspect?: boolean;
  main?: string;
  optimization?: boolean;
  outputPath?: string;
  tsConfig?: string;
}
export class NXWorkspaceDTO {
  public projects: Record<string, NXProjectDTO>;
}
export const NX_WORKSPACE_FILE = 'workspace.json';
export const SCAN_CONFIG_CONFIGURATION = 'scan-config';

export class NXMetadata {
  affected: {
    defaultBase: string;
  };
  implicitDependencies: Record<string, unknown>;
  npmScope: string;
  projects: Record<string, unknown>;
  targetDependencies: Record<'build', Record<'target' | 'projects', string>[]>;
  taskRunnerOptions: Record<
    'default',
    {
      options: {
        accessToken: string;
        cachableOperations: string[];
        canTrackAnalytics: boolean;
        showUsageWarnings: boolean;
      };
      runner: string;
    }
  >;
  workspaceLayout: Record<'appsDir' | 'libsDir', string>;
}
