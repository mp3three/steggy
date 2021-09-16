import {
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/utilities';
import { Inject, Provider } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AutoConfigService } from '../../services';

export const CONFIG_PROVIDERS = new Set<Provider>();

export function InjectConfig(path: string): ParameterDecorator {
  return function (target, key, index) {
    target[CONSUMES_CONFIG] ??= [];
    target[CONSUMES_CONFIG].push(path);
    const id = uuid();
    CONFIG_PROVIDERS.add({
      inject: [AutoConfigService],
      provide: id,
      useFactory(config: AutoConfigService) {
        const configPath: string[] = [];
        if (target[LOGGER_LIBRARY]) {
          configPath.push('libs', target[LOGGER_LIBRARY]);
        } else {
          configPath.push('application');
        }
        return config.get([...configPath, path].join('.'));
      },
    });
    return Inject(id)(target, key, index);
  };
}
