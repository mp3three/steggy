import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

/**
 * Standardized way of injecting the logger
 *
 * Would like to have a more sane way of getting the lib in later
 */
export function InjectLogger(
  cls: { name: string },
  library?: string | symbol,
): ReturnType<typeof InjectPinoLogger> {
  if (typeof library === 'symbol') {
    library = library.description;
  }
  library = library || '';
  library = library.length > 0 ? `${library}:` : '';
  return InjectPinoLogger(`${library}${cls.name}`);
}

type TraceArguments = {
  omitArgs?: boolean;
  level?: keyof PinoLogger;
  omitResult?: boolean;
};
const TRACE_ENABLED = true;

/**
 * Emits log message after function is complete
 * Contains function name as log message, function parameters, and return result.
 *
 * Must follow the repository pattern of injecting PinoLogger as this.logger
 */
export function Trace(
  config: TraceArguments = {},
): (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => void {
  config.level = config.level || 'trace';
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    // Disabling here will leave the source function unaltered
    // Trace logging is a performance hit (even if minor), so better this than changing the log level
    if (!TRACE_ENABLED) {
      return;
    }
    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      if (!config.omitArgs) {
        this.logger[config.level]({ parameters }, propertyKey);
      }
      const result = originalMethod.apply(this, parameters);
      (async () => {
        if (!config.omitResult) {
          this.logger[config.level]({ result: await result }, propertyKey);
        }
      })();
      return result;
    };
    return descriptor;
  };
}
