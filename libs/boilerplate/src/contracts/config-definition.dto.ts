import { ConfigTypeDTO } from './config';
import { AbstractConfig } from './meta';

export class ConfigDefinitionDTO {
  public application: string;
  public bootstrapOverrides?: AbstractConfig;
  public config: ConfigTypeDTO[];
}
