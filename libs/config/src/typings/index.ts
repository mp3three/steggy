import { AuthenticationConfig } from './authentication';
import { CommonConfig } from './common';
import { EmailConfig } from './email';
import { FormioSDKConfig } from './formio-sdk';
import { LicenseConfig } from './license';
import { PersistenceConfig } from './persistence';
import { ServerConfig } from './server';
import { UtilsConfig } from './utils';
export * from './authentication';
export * from './common';
export * from './email';
export * from './formio-sdk';
export * from './home-assistant';
export * from './license';
export * from './persistence';
export * from './server';
export * from './utils';
/**
 * Top level configuration object
 *
 * Extends the global common config, adding a section for the top level application to chuck in data without affecting things
 * Also provides dedicated sections for libraries to store their own configuration options
 */
export class AutomagicalConfig<
  ApplicationConfig extends Record<never, unknown> = Record<never, unknown>,
> extends CommonConfig {
  // #region Object Properties

  /**
   * Custom variables for implementations
   */
  public application?: ApplicationConfig;
  /**
   * Libraries
   */
  public libs?: {
    authentication?: AuthenticationConfig;
    ['formio-sdk']?: FormioSDKConfig;
    server?: ServerConfig;
    utils?: UtilsConfig;
    license?: LicenseConfig;
    persistence?: PersistenceConfig;
    email?: EmailConfig;
  };

  // #endregion Object Properties
}
