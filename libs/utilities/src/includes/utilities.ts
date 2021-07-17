import { BaseDTO } from '@formio/contracts/formio-sdk';

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
