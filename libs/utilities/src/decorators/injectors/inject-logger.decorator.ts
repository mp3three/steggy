import { ACTIVE_APPLICATION } from '@automagical/contracts/config';
import { Inject, Provider } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

import { AutoLogService } from '../../services/logger';

export const INJECT_LOGGER_CONTEXTS = new Set<Provider<AutoLogService>>();
const token = 'AutoLogger';

export function InjectLogger(): ParameterDecorator {
  return function (target: ClassConstructor<unknown>, key, index) {
    INJECT_LOGGER_CONTEXTS.add({
      inject: [AutoLogService, ACTIVE_APPLICATION],
      provide: `${token}:${target.name}`,
      useFactory: (logger: AutoLogService, application: symbol) => {
        logger['context'] = `${application.description}:${target.name}`;
        return logger;
      },
    });
    return Inject(`${token}:${target.name}`)(target, key, index);
  };
}
