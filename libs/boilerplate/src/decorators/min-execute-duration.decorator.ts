import { sleep } from '@text-based/utilities';

/**
 * Force a method to execute for a minimum amount of time, even if the logic inside is faster
 */
export function MinExecuteDuration(ms: number): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      const result = Reflect.apply(original, this, parameters);
      return Promise.all([result, sleep(ms)]).then(([out]) => out);
    };
    return descriptor;
  };
}
