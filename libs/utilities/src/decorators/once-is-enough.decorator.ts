/**
 * Why execute the method again if the result isn't gonna change?
 *
 * Capture the result from the first call, and return on all followup calls.
 * Not intended for use with functions that have parameters.
 */
export function OnceIsEnough(): MethodDecorator {
  let value: unknown;
  let run = false;
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      if (run === true) {
        return value;
      }
      value = original.apply(this, parameters);
      run = true;
      return value;
    };
    return descriptor;
  };
}
