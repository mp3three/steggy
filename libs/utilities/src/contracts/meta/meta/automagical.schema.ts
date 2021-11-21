// JSON schema at schemas/json/automagical.schema.json
export class AutomagicalMetadataDTO {
  configuration: Record<string, ConfigItem>;
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
  careful?: boolean;
  required?: boolean;
  warnDefault?: boolean;
}

export class AutomagicalStringConfig extends WarnDefault {
  default?: string;
  enum?: string[];
  type: 'string';
}
export class AutomagicalBooleanConfig extends WarnDefault {
  default?: boolean;
  type: 'boolean';
}
export class AutomagicalNumberConfig extends WarnDefault {
  default?: number;
  type: 'number';
}
export class AutomagicalPasswordConfig extends WarnDefault {
  type: 'password';
}
export class AutomagicalUrlConfig extends WarnDefault {
  default?: string;
  type: 'url';
}
export class AutomagicalRecordConfig extends WarnDefault {
  type: 'record';
}
export class AutomagicalStringArrayConfig extends WarnDefault {
  type: 'string[]';
}
