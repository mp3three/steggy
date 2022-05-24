import { AnyConfig, ConfigItem } from './meta';

export const CONSUMES_CONFIG = Symbol('CONSUMES_CONFIG');
export const CONFIG_DEFAULTS = Symbol('CONFIG_DEFAULTS');

export class ConfigTypeDTO<T extends AnyConfig = AnyConfig> {
  /**
   * Name of project
   */
  public library: string;
  /**
   * Description of a single config item as passed into the module
   */
  public metadata: ConfigItem<T>;
  /**
   * Property name
   */
  public property: string;
}
