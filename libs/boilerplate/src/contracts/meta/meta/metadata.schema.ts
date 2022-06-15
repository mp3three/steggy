// JSON schema at schemas/json/metadata.schema.json
export class RepoMetadataDTO {
  public configuration: Record<string, ConfigItem>;
}
export type ConfigItem<T extends AnyConfig = AnyConfig> = {
  /**
   * If no other values are provided, what value should be injected?
   * This ensures a value is always provided, and checks for undefined don't need to happen
   */
  default?: unknown;
  /**
   * Short descriptive text so humans can understand why this exists.
   * Ideally should fit on a single line
   */
  description?: string;
} & T;
export type AnyConfig =
  | StringConfig
  | BooleanConfig
  | NumberConfig
  | InternalConfig
  | RecordConfig
  | StringArrayConfig
  | PasswordConfig
  | UrlConfig;

class WarnDefault {
  /**
   * Refuse to boot if user provided value is not present.
   * This value cannot be defaulted, and it is absolutely required in order to do anything
   */
  public required?: boolean;
  /**
   * Attempt to draw attention of user to the existence of this property if the default value is still in use.
   * Use with items like default passwords / keys where a value must always exist, but the default is not ideal / insecure.
   *
   * - Emit a warning a boot if the default value is still in use.
   * - Add extra coloring to config builder
   */
  public warnDefault?: boolean;
}

export class StringConfig extends WarnDefault {
  public default?: string;
  /**
   * If provided, the value **MUST** appear in this list or the application will refuse to boot.
   */
  public enum?: string[];
  public type: 'string';
}

export class BooleanConfig extends WarnDefault {
  public default?: boolean;
  public type: 'boolean';
}

/**
 * For configurations that just can't be expressed any other way.
 * Make sure to add a helpful description on how to format the value,
 * because `config-builder` won't be able to help
 */
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

/**
 * key/value pairs
 */
export class RecordConfig extends WarnDefault {
  public type: 'record';
}

export class StringArrayConfig extends WarnDefault {
  public type: 'string[]';
}
