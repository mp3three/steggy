import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';

import { AutoLogService } from '../../services';

export function Trace(message?: string): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    let prefix = target.constructor[LOGGER_LIBRARY] ?? '';
    if (prefix) {
      prefix = `${prefix}:`;
    }
    descriptor.value = async function (...parameters) {
      AutoLogService.call(
        'trace',
        `${prefix}${target.constructor.name}`,
        `${message ?? `${prefix}${propertyKey}`} pre`,
      );
      const result = originalMethod.apply(this, parameters);
      AutoLogService.call(
        'trace',
        `${prefix}${target.constructor.name}`,
        `${message ?? `${prefix}${propertyKey}`} post`,
      );
      return result;
    };
    return descriptor;
  };
}
