import { AnyConfig, ConfigItem } from './meta';

export const CONSUMES_CONFIG = Symbol('CONSUMES_CONFIG');
export const CONFIG_DEFAULTS = Symbol('CONFIG_DEFAULTS');

export class ConfigTypeDTO<T extends AnyConfig = AnyConfig> {
  default: unknown;
  library: string;
  metadata: ConfigItem<T>;
  property: string;
}
