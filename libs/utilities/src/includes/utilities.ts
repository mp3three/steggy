// Reused numbers
// Apparantly these can affect type checking too. Cool!

export const INVERT_VALUE = -1;
// Sort
export const UP = 1;
// [LABEL,VALUE]
export const VALUE = 1;
// Standard value
export const ARRAY_OFFSET = 1;
// array[number +- increment]
export const INCREMENT = 1;
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
/**
 * Want to be really lazy? Just make a short term sleep happen
 */
const DEFAULT_SLEEP_TIME = 1000;
/**
 * Defaults to 1000 (1 second)
 *
 * @example await sleep(5000);
 */
export const sleep = (ms: number = DEFAULT_SLEEP_TIME): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));

export const filterUnique = (array: string[]): string[] => {
  return array.filter((item, index, self) => self.indexOf(item) === index);
};
export function PEAT<T extends unknown = number>(
  length: number,
  fill?: T,
): T[] {
  return Array.from({ length }).map(
    (item, index) => fill ?? ((index + ARRAY_OFFSET) as T),
  );
}
