import { ClassConstructor } from 'class-transformer';

export type CONFIG_PROVIDERS = 'ebenvironment' | 'application';

export type ConfigLibraryVisibility = 'default' | 'available' | 'hidden';
export type ConfigType =
  | 'string'
  | 'url'
  | 'number'
  | 'boolean'
  | 'array'
  | 'record'
  | 'password'
  | 'todo'
  // functions
  | CONFIG_PROVIDERS
  // enum
  | string[]
  // record
  | Record<
      'key' | 'value',
      Pick<DefaultConfigOptions, 'type' | 'title' | 'default'>
    >
  // external
  | ClassConstructor<unknown>;

export interface DefaultConfigOptions {
  // #region Object Properties

  array?: boolean;
  /**
   * Which applications are interested in this item
   */
  applications:
    | Record<string, ConfigLibraryVisibility>
    | ConfigLibraryVisibility;

  default?: unknown;
  /**
   * Which `@automagical` lib does this belong to?
   */
  library?: string;
  /**
   * Format / provider of the value
   */
  type: ConfigType;
  /**
   * Human understandable title
   */
  title?: string;

  // #endregion Object Properties
}

const config = new Map<string, Map<string, DefaultConfigOptions>>();

export function ConfigurableProperty(
  options: DefaultConfigOptions,
): PropertyDecorator {
  return (target: ClassConstructor<unknown>, key: string) => {
    const name = target.name;
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
