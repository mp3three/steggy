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
export const INVERT_VALUE = -1;
// Sort
export const UP = 1;
// [LABEL,VALUE]
export const VALUE = 1;
// Standard value
export const ARRAY_OFFSET = 1;
// array[number +- increment]
export const INCREMENT = 1;
// Generic one-ness
export const SINGLE = 1;
// Sorting
export const SAME = 0;
// [LABEL,VALUE]
export const LABEL = 0;
// Generic start of something
export const START = 0;
export const FIRST = 0;

// Testing of indexes
export const NOT_FOUND = -1;
// Sorting
export const DOWN = -1;
export const MINUTE = 60_000;
export const SECOND = 1000;

/**
 * Defaults to 1000 (1 second)
 *
 * @example await sleep(5000);
 */
export const sleep = (ms: number = SECOND): Promise<void> =>
  new Promise(done => setTimeout(() => done(), ms));

export function PEAT<T extends unknown = number>(
  length: number,
  fill?: T,
): T[] {
  return Array.from({ length }).map(
    (item, index) => fill ?? ((index + ARRAY_OFFSET) as T),
  );
}
const ALL_CAPS = 3;
const EVERYTHING_ELSE = 1;
const excluded = new Set(['fan', 'day']);
export function TitleCase(input: string, doCaps = true): string {
  const matches = input.match(new RegExp('[a-z][A-Z]', 'g'));
  if (matches) {
    matches.forEach(i => (input = input.replace(i, [...i].join(' '))));
  }
  return input
    .split(new RegExp('[ _-]'))
    .map((word = '') =>
      word.length === ALL_CAPS && doCaps && !excluded.has(word)
        ? word.toUpperCase()
        : `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`,
    )
    .join(' ');
}
export async function sendRequest<T>(
  info: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const result = await fetch(`http://10.0.0.5:7000${info}`, {
    ...init,
    headers: {
      'x-admin-key':
        'mainline dolt orangery catchall cantor beck couscous knickers',
    },
  });
  return await result.json();
}
