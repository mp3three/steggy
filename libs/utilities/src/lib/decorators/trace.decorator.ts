import { PinoLogger } from 'nestjs-pino';

type TraceArguments = {
  omitArgs?: boolean;
  levels?: {
    before?: keyof PinoLogger;
    after?: keyof PinoLogger;
  };
  message?: string;
  omitResult?: boolean;
  auditLog?: boolean;
};
const TRACE_ENABLED = true;

/**
 * Emits log message after function is complete
 * Contains function name as log message, function parameters, and return result.
 *
 * Must follow the repository pattern of injecting PinoLogger as this.logger
 */
export function Trace(config: TraceArguments = {}): MethodDecorator {
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
        this.logger[config?.levels?.before || 'trace'](
          { parameters },
          `${config.message || propertyKey} pre`,
        );
      }
      const result = originalMethod.apply(this, parameters);
      (async () => {
        if (!config.omitResult) {
          this.logger[config?.levels?.after || 'trace'](
            { result: await result },
            `${config.message || propertyKey} post`,
          );
        }
      })();
      return result;
    };
    return descriptor;
  };
}
export function CallAlert(
  message?: string,
  level?: keyof PinoLogger,
): ReturnType<typeof Trace> {
  return Trace({
    levels: {
      before: level || 'warn',
    },
    message,
    omitResult: true,
  });
}
