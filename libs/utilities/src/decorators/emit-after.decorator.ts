interface EmitAfterOptions {
  emitData?: 'result' | 'parameters';
  onlyTruthyResults?: boolean;
}
export function EmitAfter(
  eventName: string,
  { emitData, onlyTruthyResults }: EmitAfterOptions = {},
): MethodDecorator {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): unknown {
    const originalMethod = descriptor.value;
    descriptor.value = function (...parameters) {
      const out = originalMethod.apply(this, parameters);
      process.nextTick(async () => {
        const result = await out;
        let data: unknown;
        if (onlyTruthyResults && !result) {
          return;
        }
        if (emitData === 'result') {
          data = result;
        }
        if (emitData === 'parameters') {
          data = parameters;
        }
        this.eventEmitter.emit(eventName, data);
      });
      return out;
    };
    return descriptor;
  };
}
