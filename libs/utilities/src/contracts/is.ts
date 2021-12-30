/* eslint-disable @typescript-eslint/no-magic-numbers */
export const EMPTY = 0;

export const is = {
  boolean(test: unknown): test is boolean {
    return typeof test === 'boolean';
  },
  empty(
    type: string | Array<unknown> | Set<unknown> | Map<unknown, unknown>,
  ): boolean {
    if (is.string(type) || Array.isArray(type)) {
      return type.length === EMPTY;
    }
    if (type instanceof Map || type instanceof Set) {
      return type.size === EMPTY;
    }
    return true;
  },
  even(test: number): boolean {
    return test % 2 === 0;
  },
  number(test: unknown): test is number {
    return typeof test === 'number' && !Number.isNaN(test);
  },
  object(test: unknown): test is object {
    return typeof test === 'object' && test !== null;
  },
  string(test: unknown): test is string {
    return typeof test === 'string';
  },
  undefined(test: unknown): test is undefined {
    return typeof test === 'undefined';
  },
  unique<T>(out: T[]): T[] {
    return out.filter((item, index, array) => array.indexOf(item) === index);
  },
};
