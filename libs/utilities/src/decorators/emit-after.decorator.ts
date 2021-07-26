export function EmitAfter(eventName: string): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...parameters) {
      return new Promise(async (done) => {
        const result = await originalMethod.apply(this, parameters);
        done(result);
        this.eventEmitter.emit(eventName, result);
      });
    };
    return descriptor;
  };
}
