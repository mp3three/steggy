import { LOG_CONTEXT } from '@automagical/contracts/utilities';
import pino from 'pino';

import { AutoLogService } from '../services';

interface AnnotationLoggerDTO {
  // #region Object Properties

  after?: string;
  before?: string;

  // #endregion Object Properties
}

/**
 * Future expansion ideas:
 *  - Interpolation of parameters in before log messages
 *  - Interpolation of result in after log messages
 *  - Ability to add timing information to after messages
 *  - LogIf
 *  - Skip descriptor replacements for certain build configurations (ex: trace only for test env)
 */
function AnnotationLogger(
  level: pino.Level,
  message: AnnotationLoggerDTO | string,
): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    // Build time calculations
    if (!message) {
      message =
        level === 'trace'
          ? {
              after: `${target.constructor[LOG_CONTEXT]}#${key} after`,
              before: `${target.constructor[LOG_CONTEXT]}#${key} before`,
            }
          : {
              before: `${target.constructor[LOG_CONTEXT]}#${key}`,
            };
    }
    if (typeof message === 'string') {
      message = {
        before: message,
      };
    }
    const { before, after } = message;
    const original = descriptor.value;

    // Development notes:
    // - If descriptor function is async, annotation loggers will break sync functions
    // - Attempting to return a promise, awaiting the result inline, seems to break final results for some reason
    //   - Gave up on debugging in favor of nextTick side effect method
    // - Attempts to tackle this via metadata & doing descriptor replacements (or similar) with LogExplorer have been met with headaches so far
    //   - This is still the preferred solution if it can be made to work
    descriptor.value = function (...parameters) {
      // Log message prior to running function
      if (before) {
        AutoLogService.call(level, target.constructor[LOG_CONTEXT], before);
      }
      // Pass through function call w/ params
      const result = original.apply(this, parameters);
      if (after) {
        if (typeof result?.then !== 'undefined') {
          process.nextTick(async () => {
            await result;
            AutoLogService.call(level, target.constructor[LOG_CONTEXT], after);
          });
          return result;
        }
        AutoLogService.call(level, target.constructor[LOG_CONTEXT], after);
      }
      return result;
    };
    // End runtime logic
    return descriptor;
  };
}

/**
 * Emit trace level messages when method is called.
 *
 * Default operation (no args) is to emit both before + after messages
 */
export function Trace(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('trace', message);
}
/**
 * Emit a debug level message when method is called.
 *
 * Default operation (no args) is to emit prior to running the method. Recommended to add a string message
 */
export function Debug(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('debug', message);
}
/**
 * Emit an info level message when method is called.
 *
 * Default operation (no args) is to emit prior to running the method. Recommended to add a string message
 */
export function Info(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('info', message);
}
/**
 * Emit an warn level message when method is called.
 *
 * Default operation (no args) is to emit prior to running the method. Recommended to add a string message
 */
export function Warn(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('warn', message);
}
/**
 * Emit an error level message when method is called.
 *
 * Default operation (no args) is to emit prior to running the method. Recommended to add a string message
 */
export function Error(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('fatal', message);
}
