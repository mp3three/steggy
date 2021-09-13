// JSON schema at schemas/json/automagical.schema.json
export class AutomagicalMetadataDTO {
  configuration?: Record<string, ConfigItem>;
}
export const METADATA_FILE = 'automagical.json';
export type ConfigItem = {
  description?: string;
  default?: unknown;
} & AnyConfig;
type AnyConfig =
  | AutomagicalStringConfig
  | AutomagicalBooleanConfig
  | AutomagicalNumberConfig
  | AutomagicalRecordConfig
  | AutomagicalPasswordConfig
  | AutomagicalUrlConfig;

export class AutomagicalStringConfig {
  type: 'string';
  enum?: string[];
  default?: string;
}
export class AutomagicalBooleanConfig {
  type: 'boolean';
  default?: boolean;
}
export class AutomagicalNumberConfig {
  type: 'number';
  default?: number;
}
export class AutomagicalPasswordConfig {
  type: 'password';
}
export class AutomagicalUrlConfig {
  type: 'url';
  default?: string;
}
export class AutomagicalRecordConfig {
  type: 'record';
}
export class AutomagicalStringArrayConfig {
  type: 'string[]';
}
