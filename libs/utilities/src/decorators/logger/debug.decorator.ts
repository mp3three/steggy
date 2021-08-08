import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';

import { AutoLogService } from '../../services';

/**
 * Annotation to cause a class method to emit a debug message prior to executing
 *
 * Don't forget annotation order matters
 */
export function Debug(message?: string): MethodDecorator {
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
        'debug',
        `${prefix}${target.constructor.name}`,
        `${message ?? `${prefix}${propertyKey}`}`,
      );
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
