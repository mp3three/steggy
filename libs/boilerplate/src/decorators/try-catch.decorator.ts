import { AutoLogService } from '../services';

export function TryCatch(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      try {
        return Reflect.apply(original, this, parameters);
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
