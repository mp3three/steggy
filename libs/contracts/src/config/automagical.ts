import { CreateConfigurableAnnotation } from '../decorators';
import type { ApplicationConfigs } from '.';
import { ConfigLibs } from './libs-config';

const ConfigurableProperty = CreateConfigurableAnnotation();

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
    applications: 'required',
    type: undefined,
  })
  public application?: ApplicationConfigs;
  /**
   * Libraries
   */
  @ConfigurableProperty({
    applications: 'required',
    type: {
      reference: ConfigLibs,
    },
  })
  public libs?: ConfigLibs;
  /**
   * For debugging purposes
   */
  @ConfigurableProperty({
    applications: {},
    default: false,
    type: 'boolean',
  })
  public PRINT_CONFIG_AT_STARTUP?: boolean;

  // #endregion Object Properties
}
