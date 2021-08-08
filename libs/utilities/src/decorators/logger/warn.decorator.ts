import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';

import { AutoLogService } from '../../services';

/**
 * Emits log message after function is complete
 * Contains function name as log message, function parameters, and return result.
 *
 * Must follow the repository pattern of injecting PinoLogger as this.logger
 */
export function Warn(message?: string): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      let prefix = target.constructor[LOGGER_LIBRARY] ?? '';
      if (prefix) {
        prefix = `${prefix}:`;
      }
      AutoLogService.call(
        'warn',
        `${prefix}${target.constructor.name}`,
        message ?? `${prefix}${propertyKey}`,
      );

      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
