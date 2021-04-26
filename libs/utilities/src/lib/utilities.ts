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
};
const TRACE_ENABLED = true;
export function Trace(config: TraceArgs = {}) {
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
      this.logger.trace(args, propertyKey);
      return originalMethod.apply(this, params);
    };
    return descriptor;
  };
}
