import {
  APIServerApplicationSettingsDTO,
  AuthenticationConfig,
  DevtoolsApplicationSettingsDTO,
  FormioSDKConfig,
  LicenseConfig,
  LicenseServerApplicationSettingsDTO,
  PersistenceConfig,
  ServerConfig,
  UtilsConfig,
  WrapperConfig,
} from '.';
import { CommonConfig } from './common';

class ConfigLibs {
  // #region Object Properties

  public authentication?: AuthenticationConfig;
  public formiosdk?: FormioSDKConfig;
  public license?: LicenseConfig;
  public persistence?: PersistenceConfig;
  public server?: ServerConfig;
  public utils?: UtilsConfig;
  public wrapper?: WrapperConfig;

  // #endregion Object Properties
}

type ApplicationConfigs =
  | APIServerApplicationSettingsDTO
  | DevtoolsApplicationSettingsDTO
  | LicenseServerApplicationSettingsDTO;

/**
 * Top level configuration object
 *
 * Extends the global common config, adding a section for the top level application to chuck in data without affecting things
 * Also provides dedicated sections for libraries to store their own configuration options
 */
export class AutomagicalConfig extends CommonConfig {
  // #region Object Properties

  /**
   * Custom variables for implementations
   */
  public application?: ApplicationConfigs;
  /**
   * Libraries
   */
  public libs?: ConfigLibs;

  // #endregion Object Properties
}
