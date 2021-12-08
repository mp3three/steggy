// JSON schema at schemas/json/automagical.schema.json
export class AutomagicalMetadataDTO {
  public configuration: Record<string, ConfigItem>;
}
export const METADATA_FILE = 'metadata.json';
export type ConfigItem<T extends AnyConfig = AnyConfig> = {
  configurable?: boolean;
  default?: unknown;
  description?: string;
} & T;
export type AnyConfig =
  | AutomagicalStringConfig
  | AutomagicalBooleanConfig
  | AutomagicalNumberConfig
  | AutomagicalRecordConfig
  | AutomagicalPasswordConfig
  | AutomagicalUrlConfig;

class WarnDefault {
  public careful?: boolean;
  public required?: boolean;
  public warnDefault?: boolean;
}

export class AutomagicalStringConfig extends WarnDefault {
  public default?: string;
  public enum?: string[];
  public type: 'string';
}
export class AutomagicalBooleanConfig extends WarnDefault {
  public default?: boolean;
  public type: 'boolean';
}
export class AutomagicalNumberConfig extends WarnDefault {
  public default?: number;
  public type: 'number';
}
export class AutomagicalPasswordConfig extends WarnDefault {
  public type: 'password';
}
export class AutomagicalUrlConfig extends WarnDefault {
  public default?: string;
  public type: 'url';
}
export class AutomagicalRecordConfig extends WarnDefault {
  public type: 'record';
}
export class AutomagicalStringArrayConfig extends WarnDefault {
  public type: 'string[]';
}
