/* eslint-disable @typescript-eslint/no-magic-numbers */

export const is = {
  boolean(test: unknown): test is boolean {
    return typeof test === 'boolean';
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
};
