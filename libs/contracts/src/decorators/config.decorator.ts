import { ClassConstructor } from 'class-transformer';

export type COMPLEX_CONFIG_PROVIDERS = 'ebenvironment' | 'application';
export type SIMPLE_CONFIG_PROVIDERS =
  | 'string'
  | 'string[]'
  | 'url'
  | 'number'
  | 'boolean'
  | 'password';

export enum ConfigLibraryVisibility {
  required = 'required',
  all = 'all',
}
export type ConfigRecordType = Record<
  'key' | 'value',
  Pick<DefaultConfigOptions, 'type' | 'title' | 'default'>
>;
export type ConfigReferenceType = {
  reference: ClassConstructor<unknown>;
};
export type ConfigType =
  | SIMPLE_CONFIG_PROVIDERS
  // functions
  | COMPLEX_CONFIG_PROVIDERS
  // key/value pairs
  | ConfigRecordType
  | ConfigReferenceType
  | undefined
  // enum
  | string[];

export interface DefaultConfigOptions<T extends ConfigType = ConfigType> {
  array?: boolean;
  default?: unknown;
  /**
   * lib name
   */
  library?: string;
  /**
   * Human understandable title
   */
  title?: string;
  /**
   * Format / provider of the value
   */
  type: T;
}

const config = new Map<string, Map<string, DefaultConfigOptions>>();

export function LoadConfigDefinition(
  reference: string,
): Map<string, DefaultConfigOptions> {
  return config.get(reference);
}

export function ConfigurableProperty(
  options: DefaultConfigOptions,
): PropertyDecorator {
  return (target: ClassConstructor<unknown>, key: string) => {
    const name = target.constructor.name;
    if (!config.has(name)) {
      config.set(name, new Map());
    }
    const map = config.get(name);
    map.set(key, options);
    config.set(name, map);
  };
}

export const CreateConfigurableAnnotation = (
  library?: string,
): ((options: DefaultConfigOptions) => PropertyDecorator) => {
  return (options: DefaultConfigOptions) => {
    return ConfigurableProperty({
      library,
      ...options,
    });
  };
};
