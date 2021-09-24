import { Inject, Provider } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import {
  ACTIVE_APPLICATION,
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '../../contracts';
import { AutoConfigService } from '../../services';

export const CONFIG_PROVIDERS = new Set<Provider>();

export function InjectConfig(path: string): ParameterDecorator {
  return function (target, key, index) {
    target[CONSUMES_CONFIG] ??= [];
    target[CONSUMES_CONFIG].push(path);
    const id = uuid();
    CONFIG_PROVIDERS.add({
      inject: [AutoConfigService, ACTIVE_APPLICATION],
      provide: id,
      useFactory(config: AutoConfigService, application: symbol) {
        const configPath: string[] = [];
        const library: string = target[LOGGER_LIBRARY];
        if (library && library !== application.description) {
          configPath.push('libs', target[LOGGER_LIBRARY]);
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
