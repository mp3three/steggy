/**
 * Top level configuration object
 *
 * Extends the global common config, adding a section for the top level application to chuck in data without affecting things
 * Also provides dedicated sections for libraries to store their own configuration options
 */
export class AutomagicalConfig {
  public application?: Record<string, unknown>;
  public libs?: Record<string, Record<string, unknown>>;
  public PRINT_CONFIG_AT_STARTUP?: boolean;
}

export const ACTIVE_APPLICATION = Symbol('ACTIVE_APPLICATION');
