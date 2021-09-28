const MULTIPLIER = 2.55;

export function PercentConverter(): MethodDecorator {
  return function (
    target: unknown,
    key: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...parameters) {
      const result = original.apply(this, ...parameters);
      if (typeof result === 'number') {
        return Math.ceil(result * MULTIPLIER);
      }
      return new Promise(async (done) => {
        const out = await result;
        if (typeof out !== 'number') {
          return done(out);
        }
        return done(Math.ceil(out * MULTIPLIER));
      });
    };
  };
}
