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
  lib?: string | symbol,
): ReturnType<typeof InjectPinoLogger> {
  if (typeof lib === 'symbol') {
    lib = lib.description;
  }
  lib = lib || '';
  lib = lib.length ? `${lib}:` : '';
  return InjectPinoLogger(`${lib}${cls.name}`);
}

type TraceArgs = {
  omitArgs?: boolean;
  level?: 'trace' | 'debug' | 'info';
};
const TRACE_ENABLED = true;
export function Trace(
  config: TraceArgs = {},
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
    descriptor.value = function (...params) {
      const args: Record<string, unknown> = {};
      if (!config.omitArgs) {
        args.params = params;
      }
      this.logger[config.level](args, propertyKey);
      return originalMethod.apply(this, params);
    };
    return descriptor;
  };
}
