import { Inject, Provider } from '@nestjs/common';

import { AutoConfigService } from '../../services';

const providerMap = new Map<string, Provider>();

export function InjectConfig(path: string): ParameterDecorator {
  if (!providerMap.has(path)) {
    providerMap.set(path, {
      inject: [AutoConfigService],
      provide: `config:${path}`,
      useFactory(config: AutoConfigService) {
        return config.get(path);
      },
    });
  }
  return Inject(`config:${path}`);
}
