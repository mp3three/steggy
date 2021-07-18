export function EmitAfter(): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...parameters) {
      const result = await originalMethod.apply(this, parameters);
      return result;
    };
    return descriptor;
  };
}
