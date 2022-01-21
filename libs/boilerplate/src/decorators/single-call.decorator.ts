import EventEmitter from 'eventemitter3';

export function SingleCall({
  emitAfter,
}: { emitAfter?: string } = {}): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const original = descriptor.value;
    let promise;
    descriptor.value = function (...parameters) {
      if (promise) {
        return promise;
      }
      promise = new Promise(async done => {
        const result = await Reflect.apply(original, this, parameters);
        promise = undefined;
        done(result);
        if (emitAfter) {
          (this as { eventEmitter: EventEmitter }).eventEmitter.emit(
            emitAfter,
            result,
          );
        }
      });
      return promise;
    };
    return descriptor;
  };
}
