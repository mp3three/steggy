// JSON schema at schemas/json/automagical.schema.json
export class AutomagicalMetadataDTO {
  configuration: Record<string, ConfigItem>;
}
export const METADATA_FILE = 'automagical.json';
export type ConfigItem = {
  default?: unknown;
  description?: string;
} & AnyConfig;
type AnyConfig =
  | AutomagicalStringConfig
  | AutomagicalBooleanConfig
  | AutomagicalNumberConfig
  | AutomagicalRecordConfig
  | AutomagicalPasswordConfig
  | AutomagicalUrlConfig;

class WarnDefault {
  required?: boolean;
  warnDefault?: boolean;
  careful?: boolean;
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
