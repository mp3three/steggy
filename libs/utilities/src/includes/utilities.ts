const OFFSET = 1;
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
    (item, index) => fill ?? ((index + OFFSET) as T),
  );
}
/**
 * Returns a function reference to a class method while respecting mutations of the target method
 */
export function SAFE_CALLBACK<
  constructor extends Record<string, (...parameters) => unknown>,
>(
  target: constructor,
  key: keyof constructor,
): (...parameters: unknown[]) => unknown {
  return function (...parameters: unknown[]): unknown {
    return target[key](...parameters);
  };
}
