// Constanly reused numbers
export const UP = 1;
export const DOWN = -1;
export const SAME = 0;
export const LABEL = 0;
export const START = 0;
export const VALUE = 1;
export const FIRST = 0;

export const ARRAY_OFFSET = 1;

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
