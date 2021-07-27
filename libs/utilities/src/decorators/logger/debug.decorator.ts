import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { PinoLogger } from 'nestjs-pino';

import { DEBUG_ENABLED } from '.';

const BACKUP_LOGGER = new PinoLogger({
  pinoHttp: {
    level: 'debug',
  },
});

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
      // eslint-disable-next-line security/detect-object-injection
      let prefix = target.constructor[LOGGER_LIBRARY] ?? '';
      const logger: PinoLogger = this.logger ?? BACKUP_LOGGER;
      if (prefix) {
        prefix = `${prefix}:`;
      }
      if (DEBUG_ENABLED) {
        logger.debug(
          {
            context: `${prefix}${target.constructor.name}`,
          },
          `${message ?? `${prefix}${propertyKey}`}`,
        );
      }
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
