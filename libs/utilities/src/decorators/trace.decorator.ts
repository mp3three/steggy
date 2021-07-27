import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
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
let TRACE_ENABLED = true;

export function SetTrace2(state: boolean): void {
  TRACE_ENABLED = state;
}

/**
 * Emits log message after function is complete
 * Contains function name as log message, function parameters, and return result.
 *
 * Must follow the repository pattern of injecting PinoLogger as this.logger
 */
export function Trace2(config: TraceArguments = {}): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    // Disabling here will leave the source function unaltered
    // Trace logging is a performance hit (even if minor), so better this than changing the log level

    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      if (!config.omitArgs && TRACE_ENABLED) {
        this.logger[config?.levels?.before || 'trace'](
          `${config.message || propertyKey} pre`,
        );
      }
      const result = originalMethod.apply(this, parameters);
      (async () => {
        if (!config.omitResult && TRACE_ENABLED) {
          this.logger[config?.levels?.after || 'trace'](
            `${config.message || propertyKey} post`,
          );
        }
      })();
      return result;
    };
    return descriptor;
  };
}
export function Debug2(config: TraceArguments = {}): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    // Disabling here will leave the source function unaltered
    // Trace logging is a performance hit (even if minor), so better this than changing the log level

    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      if (!config.omitArgs && TRACE_ENABLED) {
        this.logger[config?.levels?.before || 'trace'](
          { parameters },
          `${config.message || propertyKey} pre`,
        );
      }
      const result = originalMethod.apply(this, parameters);
      (async () => {
        if (!config.omitResult && TRACE_ENABLED) {
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
): ReturnType<typeof Trace2> {
  return Trace2({
    levels: {
      before: level || 'warn',
    },
    message,
    omitResult: true,
  });
}
