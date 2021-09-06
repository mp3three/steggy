import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { Inject, Provider } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AutoConfigService } from '../../services';

const providerMap = new Set<Provider>();

export function InjectConfig(path: string): ParameterDecorator {
  return function (target, key, index) {
    const id = uuid();
    providerMap.add({
      inject: [AutoConfigService],
      provide: id,
      useFactory(config: AutoConfigService) {
        const configPath: string[] = [];
        if (target[LOGGER_LIBRARY]) {
          configPath.push('lib', target[LOGGER_LIBRARY]);
        } else {
          configPath.push('application');
        }
        return config.get([...configPath, path].join('.'));
      },
    });
    return Inject(id)(target, key, index);
  };
}
