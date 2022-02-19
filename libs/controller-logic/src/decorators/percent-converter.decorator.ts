import { is } from '@automagical/utilities';

const MULTIPLIER = 2.55;

export function PercentConverter(): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      const result = Reflect.apply(original, this, parameters);
      if (is.number(result)) {
        return Math.ceil(result * MULTIPLIER);
      }
      return new Promise(async (done) => {
        const out = await result;
        if (!is.number(out)) {
          return done(out);
        }
        return done(Math.ceil(out * MULTIPLIER));
      });
    };
  };
}
