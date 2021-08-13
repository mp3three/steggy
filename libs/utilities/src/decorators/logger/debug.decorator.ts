import { LOG_CONTEXT } from '@automagical/contracts/utilities';

import { AutoLogService } from '../../services';

export function Debug(message: string): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    // Disabling here will leave the source function unaltered
    // Trace logging is a performance hit (even if minor), so better this than changing the log level
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      AutoLogService.call(
        'debug',
        target.constructor[LOG_CONTEXT],
        message ?? `${target.constructor[LOG_CONTEXT]}#${key} called`,
      );
      return original.apply(this, parameters);
    };
    return descriptor;
  };
}
