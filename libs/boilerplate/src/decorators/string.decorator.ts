export function SliceLines(start: number, end: number): MethodDecorator {
  return function (target, key, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...parameters) {
      const result: string = await Reflect.apply(original, this, parameters);
      return result.split(`\n`).slice(start, end).join(`\n`);
    };
    return descriptor;
  };
}
