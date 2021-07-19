import { CreateConfigurableAnnotation } from '../decorators';
import {
  AuthenticationConfig,
  DevtoolsApplicationSettingsDTO,
  FormioSDKConfig,
  PersistenceConfig,
  ServerConfig,
  UtilsConfig,
} from '.';
import { HomeControllerApplicationSettingsDTO } from './apps';
import { CommonConfig } from './common';
import { HomeAssistantConfig } from './home-assistant';

const ConfigurableProperty = CreateConfigurableAnnotation();

class ConfigLibs {
  // #region Object Properties

  @ConfigurableProperty({
    applications: {},
    type: AuthenticationConfig,
  })
  public authentication?: AuthenticationConfig;
  @ConfigurableProperty({
    applications: {},
    type: FormioSDKConfig,
  })
  public formiosdk?: FormioSDKConfig;
  @ConfigurableProperty({
    applications: {},
    type: HomeAssistantConfig,
  })
  public homeassistant?: HomeAssistantConfig;
  @ConfigurableProperty({
    applications: {},
    type: PersistenceConfig,
  })
  public persistence?: PersistenceConfig;
  @ConfigurableProperty({
    applications: {},
    type: ServerConfig,
  })
  public server?: ServerConfig;
  @ConfigurableProperty({
    applications: {},
    type: UtilsConfig,
  })
  public utils?: UtilsConfig;

  // #endregion Object Properties
}

type ApplicationConfigs =
  | HomeControllerApplicationSettingsDTO
  | DevtoolsApplicationSettingsDTO;

/**
 * Top level configuration object
 *
 * Extends the global common config, adding a section for the top level application to chuck in data without affecting things
 * Also provides dedicated sections for libraries to store their own configuration options
 */
export class AutomagicalConfig {
  // #region Object Properties

  /**
   * Custom variables for implementations
   */
  @ConfigurableProperty({
    applications: 'default',
    type: 'todo',
  })
  public application?: ApplicationConfigs;
  @ConfigurableProperty({
    applications: 'default',
    type: CommonConfig,
  })
  public common?: CommonConfig;
  /**
   * Libraries
   */
  @ConfigurableProperty({
    applications: 'default',
    type: ConfigLibs,
  })
  public libs?: ConfigLibs;

  // #endregion Object Properties
}
