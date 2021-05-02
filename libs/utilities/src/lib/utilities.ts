import { InjectPinoLogger } from 'nestjs-pino';
/**
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));

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
      this.logger[config.level](arguments_, propertyKey);
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
