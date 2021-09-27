// JSON schema at schemas/json/automagical.schema.json
export class AutomagicalMetadataDTO {
  configuration: Record<string, ConfigItem>;
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

class WarnDefault {
  'warnDefault'?: boolean;
}

export class AutomagicalStringConfig extends WarnDefault {
  type: 'string';
  enum?: string[];
  default?: string;
}
export class AutomagicalBooleanConfig extends WarnDefault {
  type: 'boolean';
  default?: boolean;
}
export class AutomagicalNumberConfig extends WarnDefault {
  type: 'number';
  default?: number;
}
export class AutomagicalPasswordConfig extends WarnDefault {
  type: 'password';
}
export class AutomagicalUrlConfig extends WarnDefault {
  type: 'url';
  default?: string;
}
export class AutomagicalRecordConfig extends WarnDefault {
  type: 'record';
}
export class AutomagicalStringArrayConfig extends WarnDefault {
  type: 'string[]';
}
