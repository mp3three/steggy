export function SingleCall({
  emitAfter,
}: { emitAfter?: string } = {}): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    let promise;
    descriptor.value = function (...parameters) {
      if (promise) {
        return promise;
      }
      promise = new Promise(async (done) => {
        const result = await originalMethod.apply(this, parameters);
        promise = undefined;
        done(result);
        if (emitAfter) {
          return;
        }
      });
      return promise;
    };
    return descriptor;
  };
}
