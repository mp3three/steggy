import { is } from '../contracts';

function isSpecificValue(value) {
  return (
    value instanceof Buffer || value instanceof Date || value instanceof RegExp
  );
}

function cloneSpecificValue(value) {
  if (value instanceof Buffer) {
    const x = Buffer.alloc(value.length);
    value.copy(x);
    return x;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value);
  }
  throw new TypeError('Unexpected situation');
}

function deepCloneArray(array: Array<unknown>) {
  return array.map((item) => {
    if (is.object(item)) {
      if (Array.isArray(item)) {
        return deepCloneArray(item);
      }
      if (isSpecificValue(item)) {
        return cloneSpecificValue(item);
      }
      return deepExtend({}, item);
    }
    return item;
  });
}

function safeGetProperty(object, key: string) {
  return key === '__proto__' ? undefined : object[key];
}

export function deepExtend<T>(target: T, object: T): T {
  if (typeof object !== 'object' || object === null || Array.isArray(object)) {
    return;
  }
  Object.keys(object).forEach((key) => {
    const source = safeGetProperty(target, key);
    const value = safeGetProperty(object, key);
    if (value === target) {
      return;
    }
    if (typeof value !== 'object' || value === null) {
      target[key] = value;
      return;
    }
    if (Array.isArray(value)) {
      target[key] = deepCloneArray(value);
      return;
    }
    if (isSpecificValue(value)) {
      target[key] = cloneSpecificValue(value);
      return;
    }
    if (
      typeof source !== 'object' ||
      source === null ||
      Array.isArray(source)
    ) {
      target[key] = deepExtend({}, value);
      return;
    }
    target[key] = deepExtend(source, value);
  });
  return target;
}
