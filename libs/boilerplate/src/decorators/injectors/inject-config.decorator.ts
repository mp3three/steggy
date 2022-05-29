import { Inject, Provider } from '@nestjs/common';
import { is } from '@steggy/utilities';
import { v4 as uuid } from 'uuid';

import {
  ACTIVE_APPLICATION,
  ConfigItem,
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '../../contracts';
import { AutoConfigService } from '../../services';

export const CONFIG_PROVIDERS = new Set<Provider>();
export const MESSY_INJECTED_CONFIGS = new Map<string, ConfigItem>();

export function InjectConfig(
  /**
   * Name of property to inject (ex: `BASE_URL`)
   */
  path: string,
  /**
   * ### Cross project injections
   *
   * In order to access a configuration property owned by a different library, the library symbol must be provided in addition to the
   * property name as the 2nd argument
   *
   * `@InjectConfig(PAGE_SIZE, LIB_TTY) private readonly pageSize: number`
   *
   * ### "Messy definitions"
   *
   * > Feature available only for applications. Libraries are **REQUIRED** define their configurations at the module level
   *
   * For quick and dirty configurations, add metadata inline to keep everything together.
   *
   * - If reusing the configuration property multiple times, it's metadata should be attached to the module instead of here
   *
   * ```typescript
    export class ExampleClass {
      constructor(
        InjectConfig('NON_INTERACTIVE', {
          default: false,
          description: 'Process without user interactions',
          type: 'boolean',
        })
        private readonly nonInteractive: boolean,
      ) {}
    }
    ````
    > (there should be an `@` in front of that `InjectConfig`, but tsdoc hates that for me right now)
   */
  from?: symbol | ConfigItem,
): ParameterDecorator {
  return function (target, key, index) {
    if (is.object(from)) {
      MESSY_INJECTED_CONFIGS.set(path, from);
      from = undefined;
    }
    target[CONSUMES_CONFIG] ??= [];
    target[CONSUMES_CONFIG].push([path, from]);
    const id = uuid();
    CONFIG_PROVIDERS.add({
      inject: [AutoConfigService, ACTIVE_APPLICATION],
      provide: id,
      useFactory(config: AutoConfigService, application: symbol) {
        const configPath: string[] = [];
        const library: string = from
          ? from.description
          : target[LOGGER_LIBRARY];
        if (library && library !== application.description) {
          configPath.push('libs', library);
        } else {
          configPath.push('application');
        }
        configPath.push(path);
        return config.get(configPath.join('.'));
      },
    });
    return Inject(id)(target, key, index);
  };
}
InjectConfig.inject = function (path: string, from?: symbol) {
  const id = uuid();
  CONFIG_PROVIDERS.add({
    inject: [AutoConfigService, ACTIVE_APPLICATION],
    provide: id,
    useFactory(config: AutoConfigService) {
      const configPath: string[] = [];
      if (from) {
        configPath.push('libs', from.description);
      } else {
        configPath.push('application');
      }
      configPath.push(path);
      return config.get(configPath.join('.'));
    },
  });
  return id;
};
