import { ConfigItem } from '@automagical/utilities';

export const CONSUMES_CONFIG = Symbol('CONSUMES_CONFIG');
export const USE_THIS_CONFIG = Symbol('USE_THIS_CONFIG');

export class ConfigTypeDTO {
  property: string;
  library: string;
  default: unknown;
  metadata: ConfigItem;
}
