import { ACTIVE_APPLICATION } from '@automagical/contracts/config';
import { Inject, Provider } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

import { AutoLogService } from '../../services/auto-log.service';

export const contextNames = new Set<string>();
const token = 'AutoLogger';

export function InjectLogger(): ParameterDecorator {
  return function (target: ClassConstructor<unknown>, key, index) {
    contextNames.add(target.name);
    return Inject(`${token}:${target.name}`)(target, key, index);
  };
}

export function createProvidersForDecorated(): Provider<AutoLogService>[] {
  return [...contextNames.values()].map((context) => {
    return {
      inject: [AutoLogService, ACTIVE_APPLICATION],
      provide: `${token}:${context}`,
      useFactory: (logger: AutoLogService, application: symbol) => {
        logger['context'] = `${application.description}:${context}`;
        return logger;
      },
    };
  });
}
