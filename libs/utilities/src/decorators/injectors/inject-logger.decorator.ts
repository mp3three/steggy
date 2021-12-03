import { Inject, Provider } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { v4 as uuid } from 'uuid';

import { AutoLogService } from '../../services';

export const LOGGER_PROVIDERS = new Set<Provider>();
export const mappedContexts = new Map<string, string>();
export function InjectLogger(): ParameterDecorator {
  const provide = uuid();
  LOGGER_PROVIDERS.add({
    inject: [AutoLogService],
    provide,
    useFactory(logger: AutoLogService) {
      logger['contextId'] = provide;
      return logger;
    },
  });
  return function (target: ClassConstructor<unknown>, property, index) {
    mappedContexts.set(provide, target.name);
    return Inject(provide)(target, property, index);
  };
}
