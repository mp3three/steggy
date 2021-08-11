import { AutoLogService } from '../services';

export function TryCatch(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      try {
        return originalMethod.apply(this, parameters);
      } catch (error) {
        AutoLogService.call(
          'error',
          `TryCatch:Annotation:FIXME`,
          { error },
          'Caught error',
        );
      }
    };
    return descriptor;
  };
}
