import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { PinoLogger } from 'nestjs-pino';

import { TRACE_ENABLED } from '.';

const BACKUP_LOGGER = new PinoLogger({});

/**
 * Emits log message after function is complete
 * Contains function name as log message, function parameters, and return result.
 *
 * Must follow the repository pattern of injecting PinoLogger as this.logger
 */
export function Trace(message?: string): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      // eslint-disable-next-line security/detect-object-injection
      let prefix = target.constructor[LOGGER_LIBRARY] ?? '';
      const logger: PinoLogger = this.logger ?? BACKUP_LOGGER;
      if (prefix) {
        prefix = `${prefix}:`;
      }
      if (TRACE_ENABLED) {
        logger.trace(
          {
            context: `${prefix}${target.constructor.name}`,
          },
          `${message ?? `${prefix}${propertyKey}`} pre`,
        );
      }
      const result = originalMethod.apply(this, parameters);
      (async () => {
        if (TRACE_ENABLED) {
          logger.trace(
            {
              context: `${prefix}${target.constructor.name}`,
            },
            `${message ?? `${prefix}${propertyKey}`} post`,
          );
        }
      })();
      return result;
    };
    return descriptor;
  };
}
