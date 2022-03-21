// JSON schema at schemas/json/metadata.schema.json
export class RepoMetadataDTO {
  public configuration: Record<string, ConfigItem>;
}
export type ConfigItem<T extends AnyConfig = AnyConfig> = {
  configurable?: boolean;
  default?: unknown;
  description?: string;
} & T;
export type AnyConfig =
  | StringConfig
  | BooleanConfig
  | NumberConfig
  | InternalConfig
  | RecordConfig
  | PasswordConfig
  | UrlConfig;

class WarnDefault {
  public careful?: boolean;
  public required?: boolean;
  public warnDefault?: boolean;
}

export class StringConfig extends WarnDefault {
  public default?: string;
  public enum?: string[];
  public type: 'string';
}

export class BooleanConfig extends WarnDefault {
  public default?: boolean;
  public type: 'boolean';
}

export class InternalConfig extends WarnDefault {
  public default?: unknown;
  public type: 'internal';
}

export class NumberConfig extends WarnDefault {
  public default?: number;
  public type: 'number';
}

export class PasswordConfig extends WarnDefault {
  public type: 'password';
}

export class UrlConfig extends WarnDefault {
  public default?: string;
  public type: 'url';
}

export class RecordConfig extends WarnDefault {
  public type: 'record';
}

export class StringArrayConfig extends WarnDefault {
  public type: 'string[]';
}
