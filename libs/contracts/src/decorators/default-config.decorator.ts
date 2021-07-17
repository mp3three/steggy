import { applyDecorators } from '@nestjs/common';
import { ClassConstructor, Expose, Transform } from 'class-transformer';

import { APPLICATION_LIST } from '../constants';
import { CONFIG_PROVIDERS } from '../libs/terminal';

export type ConfigLibraryVisibility = 'default' | 'available' | 'hidden';
export type ConfigType =
  | 'string'
  | 'url'
  | 'enum'
  | 'number'
  | 'boolean'
  | 'array'
  | 'record'
  | 'external'
  | 'password';
export interface DefaultConfigOptions {
  // #region Object Properties

  /**
   * If omitted, all applications will be used
   */
  applications:
    | Record<string, ConfigLibraryVisibility>
    | ConfigLibraryVisibility;
  default?: unknown;
  enum?: string[];
  external?: ClassConstructor<unknown>;
  library?: string;
  provider?: CONFIG_PROVIDERS;
  record?: {
    key: string;
    value: string;
  };
  recordProvider?: {
    key?: CONFIG_PROVIDERS;
    value?: CONFIG_PROVIDERS;
  };
  type?: ConfigType;
  what?: string;

  // #endregion Object Properties
}
/**
 * Completely abuse the `class-transformer` library to allow for automated config building
 */
export const CreateAnnotation = (library?: string) => {
  return (
    options: DefaultConfigOptions,
  ): ReturnType<typeof applyDecorators> => {
    options.applications ??= {};
    options.type ??= 'string';
    options.library = library ?? '-';

    const groups =
      typeof options.applications === 'string'
        ? APPLICATION_LIST
        : Object.keys(options.applications);
    return applyDecorators(
      Expose({
        groups,
      }),
      Transform(
        () => {
          return options;
        },
        {
          groups,
        },
      ),
    );
  };
};
