import { ClassConstructor, plainToInstance } from 'class-transformer';

export function FillDefaults<T>(
  constructor: ClassConstructor<T>,
): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const original = descriptor.value;
    descriptor.value = function (data: T) {
      data = plainToInstance(constructor, data, {
        exposeDefaultValues: true,
      });
      return original.apply(this, data);
    };
    return descriptor;
  };
}
