/* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/ban-types */
export const EMPTY = 0;

// TODO: declaration merging to allow other libs to create definitions here

export const is = {
  boolean(test: unknown): test is boolean {
    return typeof test === 'boolean';
  },
  date(test: unknown): test is Date {
    return test instanceof Date;
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
  function<
    T extends (
      ...parameters: unknown[]
    ) => unknown | void | Promise<unknown | void>,
  >(test: unknown): test is T {
    return typeof test === 'function';
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
    // Technically this isn't an "is"... but close enough
    return out.filter((item, index, array) => array.indexOf(item) === index);
  },
};
