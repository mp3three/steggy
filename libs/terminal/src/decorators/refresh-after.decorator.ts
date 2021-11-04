let refreshCallback: () => void;

export function RefreshAfter(): MethodDecorator {
  return function (target, key, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...parameters) {
      const value = await Reflect.apply(original, this, parameters);
      refreshCallback();
      return value;
    };
  };
}
RefreshAfter.setEmitter = function (callback: () => void) {
  refreshCallback = callback;
};
