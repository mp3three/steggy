import { BaseDTO } from '@automagical/contracts/formio-sdk';

/**
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));
export const caseCorrect = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};
export const toId = (item: BaseDTO | string): string => {
  return typeof item === 'string' ? item : item._id;
};
export const filterUnique = (array: string[]): string[] => {
  return array.filter((item, index, self) => self.indexOf(item) === index);
};
export function PEAT<T extends unknown = number>(
  length: number,
  fill?: T,
): T[] {
  return Array.from({ length }).map(
    (item, index) => fill ?? ((index + 1) as T),
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
