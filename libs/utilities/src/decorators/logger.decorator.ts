import { LOG_CONTEXT } from '@automagical/contracts/utilities';
import pino from 'pino';

import { AutoLogService } from '../services';

export class AnnotationLoggerDTO {
  // #region Object Properties

  after?: string;
  before?: string;

  // #endregion Object Properties
}

function AnnotationLogger(
  level: pino.Level,
  message: AnnotationLoggerDTO | string,
): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ): unknown {
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
    descriptor.value = function (...parameters) {
      if (before) {
        AutoLogService.call(level, target.constructor[LOG_CONTEXT], before);
      }
      const result = original.apply(this, parameters);
      if (typeof result?.then !== 'undefined') {
        // Create a secondary watcher of the promise
        // Do not interfere with result
        // Keep async scope limited to properly support sync functions, this is the only spot that really needs it
        process.nextTick(async () => {
          await result;
          AutoLogService.call(level, target.constructor[LOG_CONTEXT], after);
        });
        return result;
      }
      if (after) {
        AutoLogService.call(level, target.constructor[LOG_CONTEXT], after);
      }
      return result;
    };
    return descriptor;
  };
}

export function Trace(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('trace', message);
}
export function Debug(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('debug', message);
}
export function Info(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('info', message);
}
export function Warn(message?: AnnotationLoggerDTO | string): MethodDecorator {
  return AnnotationLogger('warn', message);
}
