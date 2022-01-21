import { AnyConfig, ConfigItem } from './meta';

export const CONSUMES_CONFIG = Symbol('CONSUMES_CONFIG');
export const USE_THIS_CONFIG = Symbol('USE_THIS_CONFIG');

export class ConfigTypeDTO<T extends AnyConfig = AnyConfig> {
  default: unknown;
  library: string;
  metadata: ConfigItem<T>;
  property: string;
}
