import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { PinoLogger } from 'nestjs-pino';

const BACKUP_LOGGER = new PinoLogger({});

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
      // eslint-disable-next-line security/detect-object-injection
      let prefix = target.constructor[LOGGER_LIBRARY] ?? '';
      const logger: PinoLogger = this.logger ?? BACKUP_LOGGER;
      if (prefix) {
        prefix = `${prefix}:`;
      }
      logger.warn(
        {
          context: `${prefix}${target.constructor.name}`,
        },
        message ?? `${prefix}${propertyKey}`,
      );
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
