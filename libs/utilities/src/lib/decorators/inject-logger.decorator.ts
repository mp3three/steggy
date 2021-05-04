import { InjectPinoLogger } from 'nestjs-pino';

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
  level?: 'trace' | 'debug' | 'info';
};
const TRACE_ENABLED = true;
export function Trace(
  config: TraceArguments = {},
): (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => void {
  config.level = config.level || 'trace';
  if (!['trace', 'debug', 'info'].includes(config.level)) {
    throw new Error(`Bad log level: ${config.level}`);
  }
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
      const arguments_: Record<string, unknown> = {};
      if (!config.omitArgs) {
        arguments_.params = parameters;
      }
      const result = originalMethod.apply(this, parameters);
      this.logger[config.level]({ parameters, result }, propertyKey);
      return result;
    };
    return descriptor;
  };
}
